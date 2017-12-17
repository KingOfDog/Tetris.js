// const canvas = document.getElementById("tetris");
// const context = canvas.getContext('2d');

window.onresize = function (event) {
    scaleWindow();
};

function scaleWindow() {
    canvas.height = window.innerHeight - 40;
    canvas.width = canvas.height / (5 / 3);
    context.scale(canvas.width / fieldSize.x, canvas.height / fieldSize.y);
}

scaleWindow();

document.getElementById("game-play").addEventListener("click", (event) => {
    document.getElementById("game-title").parentNode.removeChild(document.getElementById("game-title"));
    document.getElementById("game-play").parentNode.removeChild(document.getElementById("game-play"));
    startGame();
});