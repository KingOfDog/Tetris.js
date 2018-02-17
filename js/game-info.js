class GameInfo {
    constructor(game) {
        this.fieldSize = {x: 12, y: 20};
        this.arena = new Arena(this, game);

        this.player = new Player(this, game);

        this.canvas = document.getElementById('tetris');
        this.context = this.canvas.getContext('2d');

        this.canvasBg = document.getElementById('tetris-background');
        this.contextBg = this.canvasBg.getContext('2d');

        this.canvasHold = document.getElementById('tetris-hold');
        this.contextHold = this.canvasHold.getContext('2d');

        this.canvasUpcoming = document.getElementById('tetris-upcoming');
        this.contextUpcoming = this.canvasUpcoming.getContext('2d');

        this.isPaused = true;

        this.dropCounter = 0;
        this.dropInterval = 1000;

        this.keys = {
            down: {
                keys: [40, 83],
                action: () => this.player.drop()
            },
            left: {
                keys: [37, 65],
                action: () => this.player.move(-1)
            },
            right: {
                keys: [39, 68],
                action: () => this.player.move(1)
            },
            rotateLeft: {
                keys: [81],
                action: () => this.player.rotate(-1)
            },
            rotateRight: {
                keys: [69],
                action: () => this.player.rotate(1)
            },
            holdTile: {
                keys: [38, 87],
                action: () => this.player.hold()
            }
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
        this.theme = 'default';
    }
}