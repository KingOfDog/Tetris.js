class Theme {
    drawTile(color, matrix, ctx) {
    }
}

class DefaultTheme extends Theme {
    drawTile(color, matrix, ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(tileGap / 2, tileGap / 2, 1 - tileGap, 1 - tileGap);
    }
}

class CleanTheme extends Theme {
    drawTile(color, matrix, ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
    }
}

class ModernTheme extends Theme {
    drawTile(color, matrix, ctx) {
        ctx.fillStyle = color;
        drawRoundRect(ctx, tileGap / 2, tileGap / 2, 1 - tileGap, 1 - tileGap, .15);
    }
}

class SnakesTheme extends Theme {
    drawTile(color, matrix, ctx, x, y) {
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
    }
}

class RetroTheme extends Theme {
    static drawReliefRect(ctx, x, y, width, height, elevation, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + elevation, y + elevation, width - (2 * elevation), height - (2 * elevation));

        ctx.fillStyle = colorLuminance(color, .6);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - elevation, y + elevation);
        ctx.lineTo(x + elevation, y + elevation);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = colorLuminance(color, .3);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + elevation, y + height - elevation);
        ctx.lineTo(x + elevation, y + elevation);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = colorLuminance(color, -.6);
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width - elevation, y + height - elevation);
        ctx.lineTo(x + elevation, y + height - elevation);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = colorLuminance(color, -.3);
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width - elevation, y + height - elevation);
        ctx.lineTo(x + width - elevation, y + elevation);
        ctx.fill();
        ctx.closePath();
    }

    drawTile(color, matrix, ctx) {
        RetroTheme.drawReliefRect(ctx, 0, 0, 1, 1, .15, color);
    }
}

const themes = {
    default: new DefaultTheme(),
    clean: new CleanTheme(),
    modern: new ModernTheme(),
    snakes: new SnakesTheme(),
    retro: new RetroTheme()
};
