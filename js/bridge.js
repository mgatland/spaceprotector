"use strict";
(function() {

	var Painter = function (ctx, pixelWindow, pixelSize) {
		var backgroundColor = "#000000";
		var pos = new Pos(0,0);

		var cameraSlackX = pixelWindow.width/8;
		var cameraSlackY = 0;

		this.setPos = function (x, y) {
			var perfectX = x - pixelWindow.width/2;
			if (perfectX > pos.x + cameraSlackX) pos.x++;
			if (perfectX < pos.x - cameraSlackX) pos.x--;

			var perfectY = y - pixelWindow.height/2;
			if (perfectY > pos.y + cameraSlackY) pos.y++;
			if (perfectY < pos.y - cameraSlackY) pos.y--;
		}

		this.clear = function() {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, pixelWindow.width*pixelSize, pixelWindow.height*pixelSize);
		}

		var drawPixel = function (x, y, color) {
			ctx.fillStyle = color;
			ctx.fillRect(x * pixelSize - pos.x * pixelSize, y * pixelSize - pos.y * pixelSize, pixelSize, pixelSize);
		}

		this.drawRect= function (x, y, width, height, color) {
			ctx.fillStyle = color;
			ctx.fillRect(x * pixelSize - pos.x * pixelSize, y * pixelSize - pos.y * pixelSize, pixelSize*width, pixelSize*height);
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