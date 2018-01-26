let arena = createMatrix(fieldSize.x, fieldSize.y);

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const canvasBg = document.getElementById('tetris-background');
const contextBg = canvasBg.getContext('2d');

const canvasHold = document.getElementById('tetris-hold');
const contextHold = canvasHold.getContext('2d');

const canvasUpcoming = document.getElementById('tetris-upcoming');
const contextUpcoming = canvasUpcoming.getContext('2d');

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

let dropCounter = 0;
let dropInterval = 1000;

const fieldSize = {x: 12, y: 20};

let holdingTile = null;

let isPaused = true;
let isHolding = false;

const keys = {
    down: {
        keys: [40, 83],
        action: () => playerDrop()
    },
    left: {
        keys: [37, 65],
        action: () => playerMove(-1)
    },
    right: {
        keys: [39, 68],
        action: () => playerMove(1)
    },
    rotateLeft: {
        keys: [81],
        action: () => playerRotate(-1)
    },
    rotateRight: {
        keys: [69],
        action: () => playerRotate(1)
    },
    holdTile: {
        keys: [38, 87],
        action: () => playerHold()
    }
};

let lastScore = 0;
let lastTime = 0;
let lastTimeUpdate = Date.now();

const pieces = 'IJLOSTZ';

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
};

let prevUpdateScore = 0;

let startTime = 0;

/*
default -> plain squares
retro -> original look
modern -> rounded corners
snake -> all tiles are connected
 */
let theme = 'default';

const tileGap = .05;

const timeElement = document.getElementById("time");
let timePassed = 0;


let upcomingTiles = [];


if (typeof console === "undefined") {
    console = {};
}

// Keyboard controls
document.addEventListener('keydown', event => {
    Object.keys(keys).map((objKey, index) => {
        const keyBind = keys[objKey];
        if (keyBind.keys.includes(event.keyCode)) {
            keyBind.action();
        }
    });
});

function addTile() {
    upcomingTiles.push(createPiece(pieces[pieces.length * Math.random() | 0]));
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
    if (player.score - prevUpdateScore > 50) {
        dropInterval -= 20;
        dropInterval = dropInterval > 100 ? dropInterval : 100;
        prevUpdateScore = player.score;
    }
    drawArena();
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

function clearScreen() {
    context.clearRect(0, 0, canvas.width, canvas.height);
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

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(player.matrix, player.pos);
}

function drawArena() {
    contextBg.fillStyle = '#000';
    contextBg.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0}, contextBg);
}

function drawHolding() {
    contextHold.clearRect(0, 0, canvasHold.width, canvasHold.height);
    const offset = centerOffset(holdingTile);
    const x = 3 - (holdingTile[0].length / 2) + offset.x;
    const y = 3 - (holdingTile.length / 2) + offset.y;
    drawMatrix(holdingTile, {x: x, y: y}, contextHold);
}

function drawMatrix(matrix, offset, useContext = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawTile(x, y, offset, colors[value], matrix, useContext);
            }
        });
    });
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

function drawTile(x, y, offset, color, matrix, useContext = context) {
    const ctx = useContext;
    switch (theme) {
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
            theme = "default";
            drawTile(x, y, offset, color, matrix, useContext);
            break;
    }
}

function formatMillis(millis) {
    const d = new Date(1000 * Math.round(millis / 1000));
    return (d.getUTCMinutes() < 10 ? "0" : "") + d.getUTCMinutes() + ":" + (d.getUTCSeconds() < 10 ? "0" : "") + d.getUTCSeconds();
}

function gameOver() {
    arena.forEach(row => row.fill(0));
    timePassed = 0;
    lastTimeUpdate = Date.now();
    updateTime();
    player.score = 0;
    dropInterval = 1000;
    updateScore();
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

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    drawArena();
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerHold() {
    if (isHolding)
        return;
    if (holdingTile === null) {
        holdingTile = player.matrix;
        playerReset(true);
    } else {
        holdingTile = [player.matrix, player.matrix = holdingTile][0];
        playerReset(true, false);
    }
    drawHolding();
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
    dropCounter *= .75;
}

function playerReset(resetHold = false, newTile = true) {
    isHolding = resetHold;
    if (newTile) {
        player.matrix = upcomingTiles[0];
        upcomingTiles.splice(0, 1);
        addTile();
    }

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        gameOver();
    }
}

function playerRotate(dir) {
    rotate(player.matrix, dir);

    const pos = player.pos.x;
    let offset = 1;
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
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

function saveHighscore() {
    if (getCookie("highscore").value < player.score) {
        document.cookie = "highscore=" + player.score + "; max-age=" + 60 * 60 * 24 * 365 * 1000 + "; path=/;";
    }
}

function startGame() {
    arena = createMatrix(fieldSize.x, fieldSize.y);
    drawArena();
    addTile();
    addTile();
    addTile();
    playerReset();
    update();
    updateScore();
    startTime = Date.now();
}

function update(time = 0) {
    if(!isPaused) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }

        updateTime();

        draw();
        requestAnimationFrame(update);
    }
}

function updateScore() {
    if(lastScore !== player.score) {
        scoreUpdateAni();
        lastScore = player.score;
        saveHighscore();
    }
    document.getElementById('score').innerText = player.score.toString();
}

function updateTime() {
    timePassed += Date.now() - lastTimeUpdate;
    timeElement.innerHTML = formatMillis(timePassed);
    lastTimeUpdate = Date.now();
}