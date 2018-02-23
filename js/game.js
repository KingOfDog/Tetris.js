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
        ctx.fillStyle = color;
        x += offset.x;
        y += offset.y;
        switch (this.g.theme) {
            case "default":
                ctx.fillRect(x + tileGap / 2, y + tileGap / 2, 1 - tileGap, 1 - tileGap);
                break;
            case "clean":
                ctx.fillRect(x, y, 1, 1);
                break;
            case "modern":
                drawRoundRect(ctx, x + tileGap / 2, y + tileGap / 2, 1 - tileGap, 1 - tileGap, .15);
                break;
            case "snakes":
                let r1 = .15, // top right
                    r2 = .15, // bottom right
                    r3 = .15, // bottom left
                    r4 = .15; // top left
                // Is there a tile to the left?
                if (matrix[y][x - 1] > 0) {
                    r3 = 0;
                    r4 = 0;
                }
                // Is there a tile to the right?
                if (matrix[y][x + 1] > 0) {
                    r1 = 0;
                    r2 = 0;
                }
                // Is there a tile to the top?
                if (matrix[y - 1] !== undefined && matrix[y - 1][x] > 0) {
                    r1 = 0;
                    r4 = 0;
                }
                // Is there a tile to the bottom?
                if (matrix[y + 1] !== undefined && matrix[y + 1][x] > 0) {
                    r2 = 0;
                    r3 = 0;
                }
                drawRoundRect(ctx, x, y, 1, 1, [r1, r2, r3, r4]);
                break;
            case "retro":
                drawReliefRect(ctx, x, y, 1, 1, .15, color);
                break;
            default:
                this.g.theme = "default";
                this.drawTile(x, y, offset, color, matrix, ctx);
                break;
        }
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

    saveHighscore() {
        if (getCookie("highscore").value < this.p.score) {
            document.cookie = "highscore=" + this.p.score + "; max-age=" + 60 * 60 * 24 * 365 * 1000 + "; path=/;";
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

    updateScore() {
        if (this.g.lastScore !== this.p.score) {
            scoreUpdateAni();
            this.g.lastScore = this.p.score;
            this.saveHighscore();
        }
        document.getElementById('score').innerText = this.p.score.toString();
    }

    updateTime() {
        timePassed += Date.now() - this.g.lastTimeUpdate;
        timeElement.innerHTML = formatMillis(timePassed);
        this.g.lastTimeUpdate = Date.now();
    }
}