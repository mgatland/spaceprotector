"use strict";
(function() {

	var Painter = function (ctx, pixelWindow, pixelSize) {
		var backgroundColor = "#000000";
		this.clear = function() {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0,0, pixelWindow.width*pixelSize, pixelWindow.height*pixelSize);
		}

		var drawPixel = function (x, y, color) {
			ctx.fillStyle = color;
			ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
		}

		this.drawSquare = function (x, y, color) {
			ctx.fillStyle = color;
			ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize*10, pixelSize*10);
		}

		this.drawSprite = function (x, y, sprite, color) {
			ctx.fillStyle = color;
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
	}

	window.Bridge = function () {
		this.showGame = function (update, draw, pixelWindow, scale, desiredFps) {
		console.log("initGame");
		var keyboard = new Keyboard();

		var canvas = document.getElementById('gamescreen');
		canvas.width = pixelWindow.width*scale;
		canvas.height = pixelWindow.height*scale;
		var ctx = canvas.getContext("2d");

		var painter = new Painter(ctx, pixelWindow, scale);

		var thisSecond = null;
		var framesThisSecond = 0;
		var currentFps = 0;
		window.setInterval(function () {
			update(keyboard);
			keyboard.update();
			requestAnimationFrame(function() {
				draw(painter);
				var newSecond = Math.floor(Date.now() / 1000);
				if (newSecond != thisSecond) {
					thisSecond = newSecond;
					currentFps = framesThisSecond;
					framesThisSecond = 0;
					//console.log(currentFps + " fps");
				}
				framesThisSecond++;
			});
		}, 1000/desiredFps);
		}
	}
})();