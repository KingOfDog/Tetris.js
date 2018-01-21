const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const bgCanvas = document.getElementById('tetris-background');
const bgContext = bgCanvas.getContext('2d');

const fieldSize = {x: 12, y: 20};
const tileGap = .05;

/*
default -> plain squares
retro -> original look
modern -> rounded corners
snake -> all tiles are connected
 */
let theme = 'default';

let isPaused = true;

let startTime = 0;
let prevUpdateScore = 0;

if (typeof console === "undefined") {
    console = {};
}

let prerenders = [];
const prerenderWidth = canvas.width / fieldSize.x * 4;
const prerenderHeight = canvas.height / fieldSize.y * 4;

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
    // bgContext.fillStyle = '#000';
    // bgContext.fillRect(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // clearScreen();

    // drawMatrix(arena, {x: 0, y: 0}, true);
    drawMatrix(player.matrix, player.pos);
}

function drawArena() {
    bgContext.fillStyle = '#000';
    bgContext.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0}, true);
}

function drawMatrix(matrix, offset, isBg) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawTile(x, y, offset, colors[value], matrix, isBg);
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

function drawTile(x, y, offset, color, matrix, isBg) {
    let ctx = context;
    if (isBg) {
        ctx = bgContext;
    }
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
            break;
    }
}

function gameOver() {
    arena.forEach(row => row.fill(0));
    passedTime = 0;
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

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
    dropCounter *= .75;
}

function playerReset() {
    const pieces = 'IJLOSTZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
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

function prerenderPiece(type, preContext) {
    createPiece(type).forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                preContext.fillStyle = colors[value];
                preContext.fillRect(x + tileGap / 2, y + tileGap / 2, 1 - tileGap, 1 - tileGap);
            }
        });
    });
}

function prerenderPieces() {
    const preCanvas = document.createElement('canvas');
    preCanvas.width = prerenderWidth;
    preCanvas.height = prerenderHeight;
    const preContext = preCanvas.getContext("2d");
    prerenderPiece("I", preContext);
    prerenders.push({
        canvas: preCanvas,
        context: preContext
    });
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

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

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

function formatMillis(millis) {
    const d = new Date(1000*Math.round(millis / 1000));
    return (d.getUTCMinutes() < 10 ? "0" : "") + d.getUTCMinutes() + ":" + (d.getUTCSeconds() < 10 ? "0" : "") + d.getUTCSeconds();
}

let lastScore = 0;
function updateScore() {
    if(lastScore !== player.score) {
        scoreUpdateAni();
        lastScore = player.score;
        saveHighscore();
    }
    document.getElementById('score').innerText = player.score.toString();
}

const timeEl = document.getElementById("time");
let passedTime = 0;
let lastTimeUpdate = Date.now();

function updateTime() {
    passedTime += Date.now() - lastTimeUpdate;
    timeEl.innerHTML = formatMillis(passedTime);
    lastTimeUpdate = Date.now();
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

let arena = createMatrix(fieldSize.x, fieldSize.y);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
};

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
    }
};

// Keyboard controls
document.addEventListener('keydown', event => {
    Object.keys(keys).map((objKey, index) => {
        const keyBind = keys[objKey];
        if (keyBind.keys.includes(event.keyCode)) {
            keyBind.action();
        }
    });
});

function startGame() {
    arena = createMatrix(fieldSize.x, fieldSize.y);
    drawArena();
    playerReset();
    update();
    updateScore();
    startTime = Date.now();
}