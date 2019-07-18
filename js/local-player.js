class LocalPlayer extends Player {
    constructor(gameInfo, game) {
        super(gameInfo, game);

        this.isHolding = false;
        this.holdingTile = null;
    }

    hold() {
        if (this.isHolding)
            return;
        if (this.holdingTile === null) {
            this.holdingTile = this.matrix;
            this.reset(true);
        } else {
            this.holdingTile = [this.matrix, this.matrix = this.holdingTile][0];
            this.reset(true, false);
        }
        this.game.drawHolding();
    }
}
