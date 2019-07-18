HTMLCanvasElement.prototype.adjustResolution = function (ctx, scale) {
    this.width = this.clientWidth;
    this.height = this.clientHeight;

    ctx.scale(scale, scale);
};
