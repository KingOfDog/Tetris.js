class TetrisManager {

    constructor() {
        this.container = document.querySelector('.game-container');

        this.instances = new Set;
    }

    createPlayer() {
        const game = new Game();
        this.instances.add(game);
    }

    init() {
        this.callAll('rescale', []);
    }

    removePlayer(tetris) {
        this.instances.delete(tetris);
    }

    start() {
        this.instances.forEach(instance => {
            instance.start();
        });
        this.init();
    }

    resume() {
        this.instances.forEach(instance => {
            instance.g.isPaused = false;
            instance.g.lastTimeUpdate = Date.now();
            if (!firstRun) {
                instance.update(instance.g.lastTime);
            }
        });
    }

    pause() {
        this.instances.forEach(instance => {
            instance.g.isPaused = true;
        });
    }

    callAll(method, args) {
        if (typeof method === 'string') {
            this.instances.forEach(instance => {
                instance[method](...args);
            });
        } else if (typeof method === 'function') {
            this.instances.forEach(instance => {
                method(instance);
            });
        }
    }
}
