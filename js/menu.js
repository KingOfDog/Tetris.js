/*
0 -> Game
1 -> Paused
2 -> Settings
 */
let escState = 1;

window.onresize = () => {
    manager.callAll('rescale', []);
};

document.addEventListener('keyup', (event) => {
    console.log(event.key);
    if (event.key === ' ') {
        if (firstRun) {
            initGame();
        } else {
            escState = escState === 0 ? 1 : 0;
            toggleMenu();
        }
    } else if (event.keyCode === 27) {
        escState++;
        if (firstRun && escState % 3 === 0) {
            escState++;
        }
        escState = escState % 3;
        toggleMenu();
    }
});

document.getElementById('game-play').addEventListener('click', () => {
    if (firstRun) {
        initGame();
    } else {
        hideMenu();
    }
});

document.getElementById('game-reset').addEventListener('click', () => {
    firstRun = true;
    game.clearScreen();
    hideMenu();
    switchLang(currentLang);
    showMenu();
});

document.getElementsByName('theme').forEach((el) => {
    el.addEventListener('change', (e) => {
        const themeName = e.target.getAttribute('data-theme');
        const theme = themes[themeName];
        manager.callAll(instance => {
            instance.g.theme = theme;
            instance.redrawScreen();
        });
    });
});

let isActive = false;
const menuButton = document.getElementById('menu-opener');

menuButton.addEventListener('click', () => {
    toggleSettings();
});

function toggleSettings() {
    if (isActive) {
        escState = 1;
        menuButton.classList.remove('active');
        document.body.classList.remove('menu-open');
    } else {
        escState = 2;
        menuButton.classList.add('active');
        document.body.classList.add('menu-open');
    }
    isActive = !isActive;
}

function toggleMenu() {
    if (escState === 0) {
        document.body.classList.remove('menu-open');
        menuButton.classList.remove('active');
        hideMenu();
    } else if (escState === 1) {
        document.body.classList.remove('menu-open');
        menuButton.classList.remove('active');
        showMenu();
    } else {
        document.body.classList.add('menu-open');
        menuButton.classList.add('active');
    }
}

function fadeBlurIn() {
    const blurEl = document.getElementById('f1').children[0];
    const finalVal = 15;
    let currentVal = 0;

    const interval = 1000 / 60;
    const id = setInterval(frame, interval);

    function frame() {
        if (currentVal >= finalVal) {
            clearInterval(id);
        } else {
            currentVal += 0.5;
            blurEl.setAttribute('stdDeviation', currentVal);
        }
    }

    setTimeout(() => {
        if (currentVal < finalVal) {
            blurEl.setAttribute('stdDeviation', finalVal);
            clearInterval(id);
            console.log('Performance Issues: system couldn\'t hold up');
        }
    }, 1000);
}

function fadeBlurOut() {
    const blurEl = document.getElementById('f1').children[0];
    const finalVal = 0;
    let currentVal = 15;

    const interval = 1000 / 60;
    const id = setInterval(frame, interval);

    function frame() {
        if (currentVal <= finalVal) {
            clearInterval(id);
        } else {
            currentVal -= 0.5;
            blurEl.setAttribute('stdDeviation', currentVal);
        }
    }

    setTimeout(() => {
        blurEl.setAttribute('stdDeviation', finalVal);
        clearInterval(id);
        if (currentVal < finalVal) {
            console.log('Performance Issues: system couldn\'t hold up');
        }
    }, 1000);
}

function showMenu() {
    manager.pause();
    escState = 1;
    document.getElementById('game-title').style.display = 'block';
    document.getElementById('game-play').style.display = 'block';
    document.getElementById('game-reset').style.display = 'block';

    document.getElementById('game-title').style.opacity = '1';
    document.getElementById('game-play').style.opacity = '1';
    fadeBlurIn();
    if (!firstRun) {
        document.getElementById('game-reset').style.opacity = '1';
    }
}

function hideMenu() {
    manager.resume();
    escState = 0;
    document.getElementById('game-title').style.opacity = '0';
    document.getElementById('game-play').style.opacity = '0';
    document.getElementById('game-reset').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('game-title').style.display = 'none';
        document.getElementById('game-play').style.display = 'none';
        document.getElementById('game-reset').style.display = 'none';
    }, 500);
    fadeBlurOut();
}

function initGame() {
    hideMenu();
    startGame();
    firstRun = false;
    switchLang(currentLang);

}
