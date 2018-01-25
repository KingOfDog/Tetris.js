const hammertime = new Hammer(document.getElementById("tetris"));

hammertime.on('swipeleft', (e) => {
    keys.left.action();
});

hammertime.on('swiperight', (e) => {
    keys.right.action();
});

hammertime.on('swipeup', () => {
    keys.holdTile.action();
});

hammertime.on('pandown swipedown', (e) => {
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