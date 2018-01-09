const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const fieldSize = {x: 12, y: 20};

let isPaused = true;

let startTime = 0;

function clearScreen() {
    context.clearRect(0, 0, canvas.width, canvas.height);
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

function formatMillis(millis) {
    const d = new Date(1000*Math.round(millis / 1000));
    return (d.getUTCMinutes() < 10 ? "0" : "") + d.getUTCMinutes() + ":" + (d.getUTCSeconds() < 10 ? "0" : "") + d.getUTCSeconds();
}

let lastScore = 0;
function updateScore() {
    if(lastScore !== player.score) {
        scoreUpdateAni();
        lastScore = player.score;
    }
    document.getElementById('score').innerText = player.score.toString();
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

let arena = new Arena(fieldSize.x, fieldSize.y);

const player = new Player();

const tetris = new Tetris();

const keys = {
    down: {
        keys: [40, 83],
        action: () => player.drop()
    },
    left: {
        keys: [37, 65],
        action: () => player.move(-1)
    },
    right: {
        keys: [39, 68],
        action: () => player.move(1)
    },
    rotateLeft: {
        keys: [81],
        action: () => player.rotate(-1)
    },
    rotateRight: {
        keys: [69],
        action: () => player.rotate(1)
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
    arena = new Arena(fieldSize.x, fieldSize.y);
    updateScore();
    startTime = Date.now();
}