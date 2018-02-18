/*
0 -> Game
1 -> Paused
2 -> Settings
 */
let escState = 1;

window.onresize = () => {
    scaleWindow();
    game.redrawScreen();
};

function scaleWindow() {
    const canvasContainer = document.getElementById("canvas-container");
    let height = .8 * window.innerHeight - 40;
    let width = height / (5 / 3);
    let conWidth = width + (2 * (height / game.g.fieldSize.y * 5));
    const ratio = width / conWidth;

    if (conWidth > window.innerWidth * .8) {
        conWidth = window.innerWidth * .8;
        width = conWidth * ratio;
        height = width * (5 / 3);
    }

    canvasContainer.style.height = height + "px";
    canvasContainer.style.width = conWidth + "px";

    game.g.canvasBg.height = height;
    game.g.canvasBg.width = width;
    game.g.contextBg.scale(width / game.g.fieldSize.x, height / game.g.fieldSize.y);

    game.g.canvas.height = height;
    game.g.canvas.width = width;
    game.g.context.scale(width / game.g.fieldSize.x, height / game.g.fieldSize.y);

    game.g.canvasHold.height = height / game.g.fieldSize.y * 5;
    game.g.canvasHold.width = game.g.canvasHold.height;
    game.g.canvasHold.style.transform = "translate(-100%, -.2em) translateX(-" + width / 2 + "px)";
    game.g.contextHold.scale(game.g.canvasHold.width / 6, game.g.canvasHold.width / 6);

    game.g.canvasUpcoming.width = height / game.g.fieldSize.y * 5;
    game.g.canvasUpcoming.height = game.g.canvasUpcoming.width * 3;
    game.g.canvasUpcoming.style.transform = "translate(100%, -.2em) translateX(" + width / 2 + "px)";
    game.g.contextUpcoming.scale(game.g.canvasUpcoming.width / 6, game.g.canvasUpcoming.width / 6);

    if (!firstRun && game.g.isPaused) {
        game.draw();
    }
}

scaleWindow();

document.addEventListener("keydown", (event) => {
    if(event.keyCode === 32) {
        if(firstRun) {
            initGame();
        } else {
            if (!game.g.isPaused) {
                showMenu();
            } else {
                hideMenu();
            }
        }
    } else if(event.keyCode === 27) {
        escState++;
        if (firstRun && escState % 3 === 0) {
            escState++;
        }
        escState = escState % 3;
        toggleMenu();
    }
});

document.getElementById("game-play").addEventListener("click", () => {
    if(firstRun) {
        initGame();
    } else {
        hideMenu();
    }
});

document.getElementById("game-reset").addEventListener("click", () => {
    firstRun = true;
    game.clearScreen();
    hideMenu();
    switchLang(currentLang);
    showMenu();
});

document.getElementsByName("theme").forEach((el) => {
    el.addEventListener("change", (e) => {
        game.g.theme = e.target.getAttribute("data-theme");
        game.redrawScreen();
    });
});

let isActive = false;
const menuButton = document.getElementById("menu-opener");

menuButton.addEventListener("click", () => {
    toggleSettings();
});

function toggleSettings() {
    if (isActive) {
        escState = 1;
        menuButton.classList.remove('active');
        document.getElementsByTagName('body')[0].classList.remove('menu-open');
    } else {
        escState = 2;
        menuButton.classList.add('active');
        document.getElementsByTagName('body')[0].classList.add('menu-open');
    }
    isActive = !isActive;
}

function toggleMenu() {
    if (escState === 0) {
        document.getElementsByTagName("body")[0].classList.remove("menu-open");
        menuButton.classList.remove('active');
        hideMenu();
    } else if (escState === 1) {
        document.getElementsByTagName("body")[0].classList.remove("menu-open");
        menuButton.classList.remove('active');
        showMenu();
    } else {
        document.getElementsByTagName("body")[0].classList.add("menu-open");
        menuButton.classList.add('active');
    }
}

function fadeBlurIn() {
    const blurEl = document.getElementById("f1").children[0];
    const finalVal = 15;
    let currentVal = 0;

    const id = setInterval(frame, 16);

    function frame() {
        if(currentVal >= finalVal) {
            clearInterval(id);
        } else {
            currentVal += 1.6;
            blurEl.setAttribute("stdDeviation", currentVal);
        }
    }

    setTimeout(() => {
        if (currentVal < finalVal) {
            blurEl.setAttribute("stdDeviation", finalVal);
            clearInterval(id);
            console.log("Performance Issues: system couldn't hold up");
        }
    }, 1000);
}

function fadeBlurOut() {
    const blurEl = document.getElementById("f1").children[0];
    const finalVal = 0;
    let currentVal = 15;

    const id = setInterval(frame, 16);

    function frame() {
        if(currentVal <= finalVal) {
            clearInterval(id);
        } else {
            currentVal -= 1.6;
            blurEl.setAttribute("stdDeviation", currentVal);
        }
    }

    setTimeout(() => {
        blurEl.setAttribute("stdDeviation", finalVal);
        clearInterval(id);
        if (currentVal < finalVal) {
            console.log("Performance Issues: system couldn't hold up");
        }
    }, 1000);
}

const scoreEl = document.getElementById("score");
const nativeTransform = getComputedStyle(scoreEl).transform;
function scoreUpdateAni() {
    scoreEl.classList.add("update");
    setTimeout(() => {
        scoreEl.classList.remove("update");
    }, 1500);
}

function showMenu() {
    game.g.isPaused = true;
    escState = 1;
    document.getElementById("game-title").style.display = "block";
    document.getElementById("game-play").style.display = "block";
    document.getElementById("game-reset").style.display = "block";

    document.getElementById("game-title").style.opacity = "1";
    document.getElementById("game-play").style.opacity = "1";
    fadeBlurIn();
    if(!firstRun) {
        document.getElementById("game-reset").style.opacity = "1";
    }
}

function hideMenu() {
    game.g.isPaused = false;
    escState = 0;
    document.getElementById("game-title").style.opacity = "0";
    document.getElementById("game-play").style.opacity = "0";
    document.getElementById("game-reset").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("game-title").style.display = "none";
        document.getElementById("game-play").style.display = "none";
        document.getElementById("game-reset").style.display = "none";
    }, 500);
    game.g.lastTimeUpdate = Date.now();
    fadeBlurOut();
    if(!firstRun) {
        game.update(game.g.lastTime);
    }
}

function initGame() {
    hideMenu();
    startGame();
    firstRun = false;
    switchLang(currentLang);

}