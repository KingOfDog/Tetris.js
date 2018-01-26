/*
0 -> Game
1 -> Paused
2 -> Settings
 */
let escState = 1;

window.onresize = () => {
    scaleWindow();
};

function scaleWindow() {
    const canvasContainer = document.getElementById("canvas-container");
    const height = window.innerHeight - 40;
    const width = height / (5 / 3);

    canvasContainer.height = height;
    canvasContainer.width = width + 200;

    canvasBg.height = height;
    canvasBg.width = width;
    contextBg.scale(width / fieldSize.x, height / fieldSize.y);

    canvas.height = height;
    canvas.width = width;
    context.scale(width / fieldSize.x, height / fieldSize.y);

    canvasHold.height = height / fieldSize.y * 4;
    canvasHold.width = canvasHold.height;
    canvasHold.style.transform = "translateX(-" + ((width / 2) + canvasHold.height) + "px) translate(-.4em, -.2em)";
    contextHold.scale(canvasHold.width / 6, canvasHold.width / 6);

    if(!firstRun && isPaused) {
        draw();
    }
}

scaleWindow();

document.addEventListener("keydown", (event) => {
    if(event.keyCode === 32) {
        if(firstRun) {
            initGame();
        } else {
            if(!isPaused){
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
    clearScreen();
    hideMenu();
    switchLang(currentLang);
    showMenu();
});

document.getElementsByName("theme").forEach((el) => {
    el.addEventListener("change", (e) => {
        theme = e.target.getAttribute("data-theme");
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
    const scale = 1.5;
    const finalScale = 1;
    let currentScale = 1;
    let upscaling = true;

    const id = setInterval(frame, 5);

    function frame() {
        if(currentScale <= scale && upscaling) {
            currentScale += 0.02;
            scoreEl.style.transform = nativeTransform + " scale(" + currentScale + ")";
        } else if (currentScale >= finalScale) {
            upscaling = false;
            currentScale -= 0.02;
            scoreEl.style.transform = nativeTransform + " scale(" + currentScale + ")";
        } else {
            clearInterval(id);
        }
    }
}

function showMenu() {
    isPaused = true;
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
    isPaused = false;
    escState = 0;
    document.getElementById("game-title").style.opacity = "0";
    document.getElementById("game-play").style.opacity = "0";
    document.getElementById("game-reset").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("game-title").style.display = "none";
        document.getElementById("game-play").style.display = "none";
        document.getElementById("game-reset").style.display = "none";
    }, 500);
    lastTimeUpdate = Date.now();
    fadeBlurOut();
    if(!firstRun) {
        update(lastTime);
    }
}

function initGame() {
    hideMenu();
    startGame();
    firstRun = false;
    switchLang(currentLang);

}