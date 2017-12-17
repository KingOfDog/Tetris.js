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

function showMenu() {
    isPaused = true;
    document.getElementById("background").classList.add("blurred");
    document.getElementById("game-title").style.display = "block";
    document.getElementById("game-play").style.display = "block";
    if(!firstRun) {
        document.getElementById("game-reset").style.display = "block";
    }
}

function hideMenu() {
    isPaused = false;
    document.getElementById("background").classList.remove("blurred");
    document.getElementById("game-title").style.display = "none";
    document.getElementById("game-play").style.display = "none";
    document.getElementById("game-reset").style.display = "none";
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