"use strict";
define(["pos", "dir", "colors"], function (Pos, Dir, Colors) {
	var Painter = function (ctx, pixelWindow, pixelSize) {
		var noOffset = new Pos(0, 0);
		var pos = new Pos(0, 0);

		var currentColor = null;

		ctx.font = (pixelSize * 10) + "px Star Perv";
		ctx.textBaseline = "top";

		this.setPos = function (cameraPos) {
			pos.x = cameraPos.x;
			pos.y = cameraPos.y;
		}

		var setColor = function(color) {
			if (color === currentColor) return;
			currentColor = color;
			ctx.fillStyle = color;
		}

		this.clear = function() {
			setColor(Colors.blank);
			ctx.fillRect(0, 0, pixelWindow.width*pixelSize, pixelWindow.height*pixelSize);
		}

		var drawPixel = function (x, y, color, absolute) {
			setColor(color);
			var offset = (absolute === true ? noOffset : pos);
			ctx.fillRect(x * pixelSize - offset.x * pixelSize, y * pixelSize - offset.y * pixelSize, pixelSize, pixelSize);
		}

		this.drawRect= function (x, y, width, height, color) {
			if (!this.isOnScreen(x, y, width, height)) return;
			setColor(color);
			ctx.fillRect(x * pixelSize - pos.x * pixelSize, y * pixelSize - pos.y * pixelSize, pixelSize*width, pixelSize*height);
		}

		this.drawAbsRect= function (x, y, width, height, color, thickness) {
			setColor(color);
			if (thickness) {
				ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize*thickness, pixelSize*height);
				ctx.fillRect((x + width - thickness) * pixelSize, y * pixelSize, pixelSize*thickness, pixelSize*height);
				ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize*width, pixelSize*thickness);
				ctx.fillRect(x * pixelSize, (y + height - thickness) * pixelSize, pixelSize*width, pixelSize*thickness);
			} else {
				//soild square
				ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize*width, pixelSize*height);	
			}
		}

		//relative defaults to false
		this.drawText = function(x, y, text, color, relative) {
			var myPos = (relative === true ? pos : noOffset);
			setColor(color);
			ctx.fillText(text, (x - myPos.x) * pixelSize, (y - myPos.y) * pixelSize);
		}

		this.screenBounds = function () {
			return {minX: pos.x,
				maxX: pos.x + pixelWindow.width,
				minY: pos.y,
				maxY: pos.y + pixelWindow.height};
		}

		this.isOnScreen = function (x, y, width, height) {
			if (x > pixelWindow.width + pos.x) return false;
			if (x + width < pos.x) return false;
			if (y > pixelWindow.height + pos.y) return false;
			if (y + height < pos.y) return false;
			return true;
		}

		this.drawSprite = function (x, y, sprite, color) {
			if (!this.isOnScreen(x, y, 12, 12)) return;
			setColor(color);
			var n = 0;
			var xN = x;
			var yN = y;
			while (sprite[n]) {
				if (sprite[n] === "1") drawPixel(xN,yN,color);
				if (sprite[n] === "\n") {
					xN = x;
					yN++;
				} else {
					xN++;
				}
				n++;
			}
		}

		var getX = function (x, dir, width) {
			if (dir === Dir.LEFT) return width - 1 - x;
			return x;
		}

		this.drawSprite2 = function (x, y, actualWidth, dir, sprite, color, absolute, decay, decayPos) {
			if (!absolute && !this.isOnScreen(x, y, sprite.width, sprite.width)) return;
			setColor(color);
			var n = 0;
			var xOff = 0;
			var yOff = 0;
			while (n < sprite.length) {
				if (sprite[n] === 1) { 
					var pX = x + getX(xOff, dir, actualWidth);
					var pY = y + yOff;
					var drawn = true;
					if (decay) {
						var dist = decayPos.distanceToXY(pX, pY)/sprite.width;
						var odds;
						if (dist < decay / 2) {
							odds = 1;
						} else {
							odds = decay;
						}
						if (Math.random() < odds) drawn = false;
					}
					if (drawn) drawPixel(pX, pY, color, absolute);
				}
				if (xOff === sprite.width - 1) {
					xOff = 0;
					yOff++
				} else {
					xOff++;
				}
				n++;
			}
		}

		var maxBarHeight = 45;
		var maxBarDistance = pixelWindow.height / 2 + maxBarHeight; //97
		this.drawWinTransition = function (animPercent) {
			var barHeight = Math.min(animPercent * 180, maxBarHeight);
			var barY = animPercent * maxBarDistance;
			this.drawAbsRect(0, pixelWindow.height / 2 - barY, pixelWindow.width, barY * 2, Colors.blank);
			this.drawAbsRect(0, pixelWindow.height / 2 - barY, pixelWindow.width, barHeight, Colors.good);
			this.drawAbsRect(0, pixelWindow.height / 2 + barY - barHeight, pixelWindow.width, barHeight, Colors.good);
		}
	};
	return Painter;
});
