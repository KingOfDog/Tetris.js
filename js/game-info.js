class GameInfo {
    constructor(game) {
        this.fieldSize = {x: 12, y: 20};
        this.arena = new Arena(this, game);

        this.player = new LocalPlayer(this, game);

        const container = document.createElement('div');
        container.className = 'game-instance';
        manager.container.appendChild(container);

        this.score = document.createElement('div');
        this.score.classList.add('game-stats', 'score');
        container.appendChild(this.score);

        this.canvasContainer = document.createElement('div');
        this.canvasContainer.className = 'canvas-container';
        container.appendChild(this.canvasContainer);

        this.canvasHold = document.createElement('canvas');
        this.canvasHold.className = 'tetris-hold';
        this.contextHold = this.canvasHold.getContext('2d');
        this.canvasContainer.appendChild(this.canvasHold);

        this.canvasBg = document.createElement('canvas');
        this.canvasBg.className = 'tetris-background';
        this.contextBg = this.canvasBg.getContext('2d');
        this.canvasContainer.appendChild(this.canvasBg);

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'tetris-arena';
        this.context = this.canvas.getContext('2d');
        this.canvasContainer.appendChild(this.canvas);

        this.canvasUpcoming = document.createElement('canvas');
        this.canvasUpcoming.className = 'tetris-upcoming';
        this.contextUpcoming = this.canvasUpcoming.getContext('2d');
        this.canvasContainer.appendChild(this.canvasUpcoming);

        this.time = document.createElement('div');
        this.time.classList.add('game-stats', 'time');
        container.appendChild(this.time);

        this.isPaused = true;

        this.dropCounter = 0;
        this.dropInterval = 1000;

        this.keys = {
            down: {
                keys: [40, 83],
                action: () => {
                    this.player.drop();
                    this.player.score++;
                    this.player.game.updateScore(false);
                },
            },
            left: {
                keys: [37, 65],
                action: () => this.player.move(-1),
            },
            right: {
                keys: [39, 68],
                action: () => this.player.move(1),
            },
            rotateLeft: {
                keys: [81],
                action: () => this.player.rotate(-1),
            },
            rotateRight: {
                keys: [69],
                action: () => this.player.rotate(1),
            },
            holdTile: {
                keys: [38, 87],
                action: () => this.player.hold(),
            },
        };

        this.prevUpdateScore = 0;

        this.lastScore = 0;
        this.lastTime = 0;
        this.lastTimeUpdate = Date.now();

        this.startTime = 0;

        this.upcomingTiles = [];

        /*
        default -> plain squares
        retro -> original look
        modern -> rounded corners
        snake -> all tiles are connected
         */
        this.theme = new DefaultTheme();
    }

    updateScore(animate) {
        this.score.innerText = this.lastScore;
        if (animate) {
            this.score.classList.add('update');
            setTimeout(() => {
                this.score.classList.remove('update');
            }, 1000);
        }
    }
}
