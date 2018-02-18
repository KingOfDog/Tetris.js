class Arena {
    constructor(gameInfo, game) {
        this.g = gameInfo;
        this.game = game;
        this.p = this.g.player;
        this.field = createMatrix(this.g.fieldSize.x, this.g.fieldSize.y);
    }

    clearScreen() {
        this.g.context.clearRect(0, 0, this.g.canvas.width, this.g.canvas.height);
    }

    sweep() {
        let rowCount = 1;
        outer: for (let y = this.field.length - 1; y > 0; --y) {
            for (let x = 0; x < this.field[y].length; ++x) {
                if (this.field[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.field.splice(y, 1)[0].fill(0);
            this.field.unshift(row);
            ++y;

            this.p.score += rowCount * 10;
            rowCount *= 2;
        }
        if (this.p.score - this.g.prevUpdateScore > 50) {
            this.g.dropInterval -= 20;
            this.g.dropInterval = this.g.dropInterval > 100 ? this.g.dropInterval : 100;
            this.g.prevUpdateScore = this.p.score;
        }
        this.game.drawArena();
    }
}