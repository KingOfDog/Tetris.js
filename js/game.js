class Game {
    constructor() {
        this.g = new GameInfo(this);
        this.p = this.g.player;

        this.registerListeners();
    }

    draw() {
        this.g.context.clearRect(0, 0, this.g.canvas.width, this.g.canvas.height);
        this.drawMatrix(this.p.matrix, this.p.pos);
    }

    drawArena() {
        this.g.contextBg.fillStyle = '#000';
        this.g.contextBg.fillRect(0, 0, this.g.canvas.width, this.g.canvas.height);
        this.drawMatrix(this.g.arena.field, {x: 0, y: 0}, this.g.contextBg);
    }

    drawHolding() {
        if (this.p.holdingTile === null)
            return;
        this.g.contextHold.clearRect(0, 0, this.g.canvasHold.width, this.g.canvasHold.height);
        const offset = centerOffset(this.p.holdingTile);
        const x = 3 - (this.p.holdingTile[0].length / 2) + offset.x;
        const y = 3 - (this.p.holdingTile.length / 2) + offset.y;
        this.drawMatrix(this.p.holdingTile, {x: x, y: y}, this.g.contextHold);
    }

    drawMatrix(matrix, offset, useContext = this.g.context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawTile(x, y, offset, colors[value], matrix, useContext);
                }
            });
        });
    }

    drawTile(x, y, offset, color, matrix, ctx = this.g.context) {
        x += offset.x;
        y += offset.y;

        ctx.save();
        ctx.translate(x, y);

        this.g.theme.drawTile(color, matrix, ctx, x, y);
        ctx.restore();
    }

    drawUpcoming() {
        this.g.contextUpcoming.clearRect(0, 0, this.g.canvasUpcoming.width, this.g.canvasUpcoming.height);
        let offsetY = 0;
        let offset;
        this.g.upcomingTiles.forEach((tile) => {
            offset = centerOffset(tile);
            const x = 3 - (tile[0].length / 2) + offset.x;
            const y = offsetY + 3 - (tile.length / 2) + offset.y;
            this.drawMatrix(tile, {x: x, y: y}, this.g.contextUpcoming);
            offsetY += 6;
        });
    }

    gameOver() {
        this.g.arena.field.forEach(row => row.fill(0));
        timePassed = 0;
        this.g.lastTimeUpdate = Date.now();
        this.updateTime();
        this.p.score = 0;
        this.g.dropInterval = 1000;
        this.updateScore();
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena.field[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
        this.drawArena();
    }

    redrawScreen() {
        this.draw();
        this.drawArena();
        this.drawHolding();
        this.drawUpcoming();
    }

    registerListeners() {
        // Keyboard controls
        document.addEventListener('keydown', event => {
            Object.keys(this.g.keys).map((objKey) => {
                const keyBind = this.g.keys[objKey];
                if (keyBind.keys.includes(event.keyCode)) {
                    keyBind.action();
                }
            });
        });
    }

    rescale() {
        let conWidth = manager.container.clientWidth / manager.instances.size;
        let conHeight = manager.container.clientHeight - 78;

        if (conHeight < conWidth) {
            conWidth = conHeight;
        }

        conWidth = Math.floor(conWidth);

        const canvasScale = Math.floor(conWidth * .6 / this.g.fieldSize.x);
        const canvasHoldScale = Math.floor(conWidth * .2 / 6);

        const realWidth = canvasScale * this.g.fieldSize.x + 2 * canvasHoldScale * 6;
        const realHeight = canvasScale * this.g.fieldSize.y;

        this.g.canvasContainer.style.width = realWidth + 'px';
        this.g.canvasContainer.style.height = realHeight + 'px';

        this.g.canvasUpcoming.style.height = this.g.canvasUpcoming.clientWidth * 3 + 'px';
        this.g.canvasHold.style.height = this.g.canvasHold.clientWidth + 'px';

        this.g.canvasBg.adjustResolution(this.g.contextBg, canvasScale);
        this.g.canvas.adjustResolution(this.g.context, canvasScale);
        this.g.canvasUpcoming.adjustResolution(this.g.contextUpcoming, canvasHoldScale);
        this.g.canvasHold.adjustResolution(this.g.contextHold, canvasHoldScale);

        if (!firstRun && this.g.isPaused) {
            this.draw();
        }
        this.redrawScreen();
    }

    saveHighscore() {
        if (getCookie('highscore') && getCookie('highscore').value < this.p.score) {
            document.cookie = 'highscore=' + this.p.score + '; max-age=' + 60 * 60 * 24 * 365 * 1000 + '; path=/;';
        }
    }

    start() {
        this.drawArena();
        this.p.addTile();
        this.p.addTile();
        this.p.addTile();
        this.p.reset();
        this.g.startTime = Date.now();
        this.update();
        this.updateScore();
    }

    update(time = 0) {
        if (!this.g.isPaused) {
            const deltaTime = time - this.g.lastTime;
            this.g.lastTime = time;

            this.g.dropCounter += deltaTime;
            if (this.g.dropCounter > this.g.dropInterval) {
                this.p.drop();
            }

            this.updateTime();

            this.draw();
            requestAnimationFrame(this.update.bind(this));
        }
    }

    updateScore(animate = true) {
        if (this.g.lastScore !== this.p.score) {
            this.g.updateScore(animate);
            this.g.lastScore = this.p.score;
            this.saveHighscore();

            if (this.p.score - this.p.lastLevelScore > 500) {
                this.p.lastLevelScore = this.p.score;
                this.p.level++;
                this.g.dropInterval *= .9;
            }
        }
        this.g.updateScore(false);
    }

    updateTime() {
        timePassed += Date.now() - this.g.lastTimeUpdate;
        this.g.time.innerText = formatMillis(timePassed);
        this.g.lastTimeUpdate = Date.now();
    }
}
