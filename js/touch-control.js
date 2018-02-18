const hammertime = new Hammer(document.getElementById("tetris"));

hammertime.on('swipeleft', (e) => {
    game.g.keys.left.action();
});

hammertime.on('swiperight', (e) => {
    game.g.keys.right.action();
});

hammertime.on('swipeup', () => {
    game.g.keys.holdTile.action();
});

hammertime.on('pandown swipedown', (e) => {
    game.g.keys.down.action();
});

hammertime.on('tap', (e) => {
    if (e.tapCount >= 2) {
        game.g.keys.rotateRight.action();
    }
});

hammertime.on('press', () => {
    game.g.keys.down.action();
});