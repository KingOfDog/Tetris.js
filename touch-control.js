const hammertime = new Hammer(document.getElementById("tetris"));

hammertime.on('swipeleft', () => {
    keys.left.action();
});

hammertime.on('swiperight', () => {
    keys.right.action();
});

hammertime.on('pandown', (e) => {
    console.log(e.direction);
    keys.down.action();
});

hammertime.on('tap', (e) => {
    if (e.tapCount >= 2) {
        keys.rotateRight.action();
    }
});

hammertime.on('press', () => {
    keys.down.action();
});