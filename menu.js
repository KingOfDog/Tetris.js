window.onresize = () => {
    scaleWindow();
};

function scaleWindow() {
    canvas.height = window.innerHeight - 40;
    canvas.width = canvas.height / (5 / 3);
    context.scale(canvas.width / fieldSize.x, canvas.height / fieldSize.y);
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
        if(!firstRun) {
            toggleMenu();
        }
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

function toggleMenu() {
    if(!isPaused){
        showMenu();
    } else {
        hideMenu();
    }
}

function fadeBlurIn() {
    const blurEl = document.getElementById("f1").children[0];
    const finalVal = 15;
    let currentVal = 0;

    const id = setInterval(frame, 1);
    function frame() {
        if(currentVal >= finalVal) {
            clearInterval(id);
        } else {
            currentVal += 0.1;
            blurEl.setAttribute("stdDeviation", currentVal);
        }
    }
}

function fadeBlurOut() {
    const blurEl = document.getElementById("f1").children[0];
    const finalVal = 0;
    let currentVal = 15;

    const id = setInterval(frame, 1);
    function frame() {
        if(currentVal <= finalVal) {
            clearInterval(id);
        } else {
            currentVal -= 0.1;
            blurEl.setAttribute("stdDeviation", currentVal);
        }
    }
}

function scoreUpdateAni() {
    const scoreEl = document.getElementById("score");
    const nativeTransform = "translate(-50%, -50%)";

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
    document.getElementById("game-title").style.opacity = "1";
    document.getElementById("game-play").style.opacity = "1";
    fadeBlurIn();
    if(!firstRun) {
        document.getElementById("game-reset").style.opacity = "1";
    }
}

function hideMenu() {
    isPaused = false;
    // document.getElementById("background").classList.remove("blurred");
    document.getElementById("game-title").style.opacity = "0";
    document.getElementById("game-play").style.opacity = "0";
    document.getElementById("game-reset").style.opacity = "0";
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