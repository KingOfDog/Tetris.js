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