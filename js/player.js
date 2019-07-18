class Player {
    constructor(gameInfo, game) {
        this.g = gameInfo;
        this.game = game;
        this.a = this.g.arena;
        this.pos = {x: 0, y: 0};
        this.matrix = null;
        this.score = 0;
        this.level = 1;
        this.lastLevelScore = 0;

        this.a.p = this;
    }

    addTile() {
        this.g.upcomingTiles.push(createPiece(pieces[pieces.length * Math.random() | 0]));
    }

    drop() {
        this.pos.y++;
        if (collide(this.a.field, this)) {
            this.pos.y--;
            this.game.merge(this.a, this);
            this.reset();
            this.a.sweep();
            this.game.updateScore();
        }
        this.g.dropCounter = 0;
    }

    move(dir) {
        this.pos.x += dir;
        if (collide(this.a.field, this)) {
            this.pos.x -= dir;
        }
        this.g.dropCounter *= .75;
    }

    reset(resetHold = false, newTile = true) {
        this.isHolding = resetHold;
        if (newTile) {
            this.matrix = this.g.upcomingTiles[0];
            this.g.upcomingTiles.splice(0, 1);
            this.addTile();
        }

        this.pos.y = 0;
        this.pos.x = (this.a.field[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);

        this.game.drawUpcoming();

        if (collide(this.a.field, this)) {
            this.game.gameOver();
        }
    }

    rotate(dir) {
        rotate(this.matrix, dir);

        const pos = this.pos.x;
        let offset = 1;
        while (collide(this.a.field, this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                rotate(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
    }
}
