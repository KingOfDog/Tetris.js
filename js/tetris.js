class GameInfo {
    constructor(game) {
        this.fieldSize = {x: 12, y: 20};
        this.arena = new Arena(this, game);

        this.player = new Player(this, game);

        this.canvas = document.getElementById('tetris');
        this.context = this.canvas.getContext('2d');

        this.canvasBg = document.getElementById('tetris-background');
        this.contextBg = this.canvasBg.getContext('2d');

        this.canvasHold = document.getElementById('tetris-hold');
        this.contextHold = this.canvasHold.getContext('2d');

        this.canvasUpcoming = document.getElementById('tetris-upcoming');
        this.contextUpcoming = this.canvasUpcoming.getContext('2d');

        this.isPaused = true;

        this.dropCounter = 0;
        this.dropInterval = 1000;

        this.keys = {
            down: {
                keys: [40, 83],
                action: () => this.player.drop()
            },
            left: {
                keys: [37, 65],
                action: () => this.player.move(-1)
            },
            right: {
                keys: [39, 68],
                action: () => this.player.move(1)
            },
            rotateLeft: {
                keys: [81],
                action: () => this.player.rotate(-1)
            },
            rotateRight: {
                keys: [69],
                action: () => this.player.rotate(1)
            },
            holdTile: {
                keys: [38, 87],
                action: () => this.player.hold()
            }
        };

        this.prevUpdateScore = 0;

        this.lastScore = 0;
        this.lastTime = 0;
        this.lastTimeUpdate = Date.now();

        this.startTime = 0;

        this.upcomingTiles = [];

        /*
        default -> plain squares
        retro -> original look
        modern -> rounded corners
        snake -> all tiles are connected
         */
        this.theme = 'default';
    }
}

class Game {
    constructor() {
        this.g = new GameInfo(this);
        this.p = this.g.player;

        this.registerListeners();
    }

    draw() {
        this.g.context.clearRect(0, 0, this.g.canvas.width, this.g.canvas.height);
        this.drawMatrix(this.p.matrix, this.p.pos);
    }

    drawArena() {
        this.g.contextBg.fillStyle = '#000';
        this.g.contextBg.fillRect(0, 0, this.g.canvas.width, this.g.canvas.height);
        this.drawMatrix(this.g.arena.field, {x: 0, y: 0}, this.g.contextBg);
    }

    drawHolding() {
        this.g.contextHold.clearRect(0, 0, this.g.canvasHold.width, this.g.canvasHold.height);
        const offset = centerOffset(this.p.holdingTile);
        const x = 3 - (this.p.holdingTile[0].length / 2) + offset.x;
        const y = 3 - (this.p.holdingTile.length / 2) + offset.y;
        this.drawMatrix(this.p.holdingTile, {x: x, y: y}, this.g.contextHold);
    }

    drawMatrix(matrix, offset, useContext = this.g.context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawTile(x, y, offset, colors[value], matrix, useContext);
                }
            });
        });
    }

    drawTile(x, y, offset, color, matrix, useContext = this.g.context) {
        const ctx = useContext;
        switch (this.g.theme) {
            case "default":
                ctx.fillStyle = color;
                ctx.fillRect(x + offset.x + tileGap / 2, y + offset.y + tileGap / 2, 1 - tileGap, 1 - tileGap);
                break;
            case "modern":
                ctx.fillStyle = color;
                drawRoundRect(ctx, x + offset.x + tileGap / 2, y + offset.y + tileGap / 2, 1 - tileGap, 1 - tileGap, .15);
                break;
            case "snakes":
                ctx.fillStyle = color;
                let r1 = .15, // top right
                    r2 = .15, // bottom right
                    r3 = .15, // bottom left
                    r4 = .15; // top left
                // Is there a tile to the left?
                if (matrix[y][x - 1] > 0) {
                    r3 = 0;
                    r4 = 0;
                }
                // Is there a tile to the right?
                if (matrix[y][x + 1] > 0) {
                    r1 = 0;
                    r2 = 0;
                }
                // Is there a tile to the top?
                if (matrix[y - 1] !== undefined && matrix[y - 1][x] > 0) {
                    r1 = 0;
                    r4 = 0;
                }
                // Is there a tile to the bottom?
                if (matrix[y + 1] !== undefined && matrix[y + 1][x] > 0) {
                    r2 = 0;
                    r3 = 0;
                }
                drawRoundRect(ctx, x + offset.x, y + offset.y, 1, 1, [r1, r2, r3, r4]);
                break;
            default:
                this.g.theme = "default";
                this.drawTile(x, y, offset, color, matrix, ctx);
                break;
        }
    }

    drawUpcoming() {
        this.g.contextUpcoming.clearRect(0, 0, this.g.canvasUpcoming.width, this.g.canvasUpcoming.height);
        let offsetY = 0;
        let offset;
        this.g.upcomingTiles.forEach((tile) => {
            offset = centerOffset(tile);
            const x = 3 - (tile[0].length / 2) + offset.x;
            const y = offsetY + 3 - (tile.length / 2) + offset.y;
            this.drawMatrix(tile, {x: x, y: y}, this.g.contextUpcoming);
            offsetY += 6;
        });
    }

    gameOver() {
        this.g.arena.field.forEach(row => row.fill(0));
        timePassed = 0;
        this.g.lastTimeUpdate = Date.now();
        this.updateTime();
        this.p.score = 0;
        this.g.dropInterval = 1000;
        this.updateScore();
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena.field[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
        this.drawArena();
    }

    registerListeners() {
        // Keyboard controls
        document.addEventListener('keydown', event => {
            Object.keys(this.g.keys).map((objKey) => {
                const keyBind = this.g.keys[objKey];
                if (keyBind.keys.includes(event.keyCode)) {
                    keyBind.action();
                }
            });
        });
    }

    saveHighscore() {
        if (getCookie("highscore").value < this.p.score) {
            document.cookie = "highscore=" + this.p.score + "; max-age=" + 60 * 60 * 24 * 365 * 1000 + "; path=/;";
        }
    }

    start() {
        this.drawArena();
        this.p.addTile();
        this.p.addTile();
        this.p.addTile();
        this.p.reset();
        this.g.startTime = Date.now();
        this.update();
        this.updateScore();
    }

    update(time = 0) {
        if (!this.g.isPaused) {
            const deltaTime = time - this.g.lastTime;
            this.g.lastTime = time;

            this.g.dropCounter += deltaTime;
            if (this.g.dropCounter > this.g.dropInterval) {
                this.p.drop();
            }

            this.updateTime();

            this.draw();
            requestAnimationFrame(this.update.bind(this));
        }
    }

    updateScore() {
        if (this.g.lastScore !== this.p.score) {
            scoreUpdateAni();
            this.g.lastScore = this.p.score;
            this.saveHighscore();
        }
        document.getElementById('score').innerText = this.p.score.toString();
    }

    updateTime() {
        timePassed += Date.now() - this.g.lastTimeUpdate;
        timeElement.innerHTML = formatMillis(timePassed);
        this.g.lastTimeUpdate = Date.now();
    }
}

class Arena {
    constructor(gameInfo, game) {
        this.g = gameInfo;
        this.game = game;
        this.field = createMatrix(this.g.fieldSize.x, this.g.fieldSize.y);
    }

    clearScreen() {
        this.g.context.clearRect(0, 0, this.g.canvas.width, this.g.canvas.height);
    }

    sweep() {
        let rowCount = 1;
        outer: for (let y = this.field.length - 1; y > 0; --y) {
            for (let x = 0; x < this.field[y].length; ++x) {
                if (this.field[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.field.splice(y, 1)[0].fill(0);
            this.field.unshift(row);
            ++y;

            this.p.score += rowCount * 10;
            rowCount *= 2;
        }
        if (this.p.score - this.g.prevUpdateScore > 50) {
            this.g.dropInterval -= 20;
            this.g.dropInterval = this.g.dropInterval > 100 ? this.g.dropInterval : 100;
            this.g.prevUpdateScore = this.p.score;
        }
        this.game.drawArena();
    }
}

class Player {
    constructor(gameInfo, game) {
        this.g = gameInfo;
        this.game = game;
        this.a = this.g.arena;
        this.pos = {x: 0, y: 0};
        this.matrix = null;
        this.score = 0;

        this.isHolding = false;
        this.holdingTile = null;

        this.a.p = this;
    }

    addTile() {
        this.g.upcomingTiles.push(createPiece(pieces[pieces.length * Math.random() | 0]));
    }

    drop() {
        this.pos.y++;
        if (collide(this.a.field, this)) {
            this.pos.y--;
            this.game.merge(this.a, this);
            this.reset();
            this.a.sweep();
            this.game.updateScore();
        }
        this.g.dropCounter = 0;
    }

    hold() {
        if (this.isHolding)
            return;
        if (this.holdingTile === null) {
            this.holdingTile = this.matrix;
            this.reset(true);
        } else {
            this.holdingTile = [this.matrix, this.matrix = this.holdingTile][0];
            this.reset(true, false);
        }
        this.game.drawHolding();
    }

    move(dir) {
        this.pos.x += dir;
        if (collide(this.a.field, this)) {
            this.pos.x -= dir;
        }
        this.g.dropCounter *= .75;
    }

    reset(resetHold = false, newTile = true) {
        this.isHolding = resetHold;
        if (newTile) {
            this.matrix = this.g.upcomingTiles[0];
            this.g.upcomingTiles.splice(0, 1);
            this.addTile();
        }

        this.pos.y = 0;
        this.pos.x = (this.a.field[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);

        this.game.drawUpcoming();

        if (collide(this.a.field, this)) {
            this.game.gameOver();
        }
    }

    rotate(dir) {
        rotate(this.matrix, dir);

        const pos = this.pos.x;
        let offset = 1;
        while (collide(this.a.field, this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                rotate(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
    }
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const pieces = 'IJLOSTZ';

const tileGap = .05;

const timeElement = document.getElementById("time");
let timePassed = 0;

if (typeof console === "undefined") {
    console = {};
}

function centerOffset(matrix) {
    let offsetX = 0;
    let offsetY = 0;
    matrix.forEach((row, y) => {
        let onlyZeroesY = true;
        row.forEach((value, x) => {
            if (value > 0) {
                onlyZeroesY = false;
            }
        });
        if (onlyZeroesY) {
            if (y < matrix.length / 2)
                offsetY -= .5;
            else
                offsetY += .5;
        }
    });
    for (let x = 0; x < matrix[0].length; x++) {
        let onlyZeroesX = true;
        matrix.forEach((row, y) => {
            if (row[x] > 0)
                onlyZeroesX = false;
        });
        if (onlyZeroesX) {
            if (x < matrix[0].length / 2)
                offsetX -= .5;
            else
                offsetX += .5;
        }
    }
    return {x: offsetX, y: offsetY};
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ];
        case 'O':
            return [
                [2, 2],
                [2, 2]
            ];
        case 'J':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [3, 3, 0]
            ];
        case 'L':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 4]
            ];
        case 'I':
            return [
                [0, 0, 5, 0],
                [0, 0, 5, 0],
                [0, 0, 5, 0],
                [0, 0, 5, 0]
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ];
    }
}

function drawRoundRect(ctx, x, y, w, h, r) {
    let r1 = r,
        r2 = r,
        r3 = r,
        r4 = r;
    if (typeof r === "number") {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
    } else {
        r.forEach((corner, index) => {
            if (w < 2 * r[index]) r[index] = w / 2;
            if (h < 2 * r[index]) r[index] = h / 2;
        });
        r1 = r[0];
        r2 = r[1];
        r3 = r[2];
        r4 = r[3];
    }
    ctx.beginPath();
    ctx.moveTo(x + r1, y);
    if (r1 > 0) {
        ctx.arcTo(x + w, y, x + w, y + h, r1);
    } else {
        ctx.lineTo(x + w, y);
    }
    if (r2 > 0) {
        ctx.arcTo(x + w, y + h, x, y + h, r2);
    } else {
        ctx.lineTo(x + w, y + h);
    }
    if (r3 > 0) {
        ctx.arcTo(x, y + h, x, y, r3);
    } else {
        ctx.lineTo(x, y + h);
    }
    if (r4 > 0) {
        ctx.arcTo(x, y, x + w, y, r4);
    } else {
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

function formatMillis(millis) {
    const d = new Date(1000 * Math.round(millis / 1000));
    return (d.getUTCMinutes() < 10 ? "0" : "") + d.getUTCMinutes() + ":" + (d.getUTCSeconds() < 10 ? "0" : "") + d.getUTCSeconds();
}

function getCookie(name) {
    if (document.cookie === "") {
        return;
    }
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let biscuit = (cookies[i]).split("=");
        if (biscuit[0] === name)
            return {name: biscuit[0], value: biscuit[1]};
    }
}

function getCookies() {
    if (document.cookie === "") {
        return;
    }
    const cookies = document.cookie.split(";");
    const cookieList = [];
    for (let i = 0; i < cookies.length; i++) {
        let biscuit = (cookies[i]).split("=");
        cookieList.push({
            name: biscuit[0],
            value: biscuit[1]
        });
    }
}

function move(ctx = context, matrix, startX, startY, diffX, diffY, duration) {
    let x = startX;
    let y = startY;
    const speedX = diffX / (duration / 1000);
    const speedY = diffY / (duration / 1000);
    let startTime = Date.now();
    // const frames = duration / 60;
    const ani = setInterval(frame, 16.6);

    function frame() {
        if (Date.now() - startTime >= duration) {
            clearInterval(ani);
            return;
        }
        // ctx.clearRect(x, y, matrix[0].length, matrix.length);
        x += speedX * (Date.now() - startTime) / 1000;
        y += speedY * (Date.now() - startTime) / 1000;
        ctx.fillStyle = "#fff";
        ctx.rect(x, y, matrix[0].length, matrix.length);
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

const game = new Game();

function startGame() {
    game.start();
}