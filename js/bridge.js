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
			if (!this.isOnScreen(x, y, width, height)) return;
			ctx.fillStyle = color;
			ctx.fillRect(x * pixelSize - pos.x * pixelSize, y * pixelSize - pos.y * pixelSize, pixelSize*width, pixelSize*height);
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

		var getX = function (x, dir, width) {
			if (dir === Dir.LEFT) return width - 1 - x;
			return x;
		}

		this.drawSprite2 = function (x, y, actualWidth, dir, sprite, color) {
			if (!this.isOnScreen(x, y, sprite.width, sprite.width)) return;
			ctx.fillStyle = color;
			var n = 0;
			var xOff = 0;
			var yOff = 0;
			while (n < sprite.length) {
				if (sprite[n] === 1) drawPixel(x + getX(xOff, dir, actualWidth), y + yOff, color);
				if (xOff === sprite.width - 1) {
					xOff = 0;
					yOff++
				} else {
					xOff++;
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

		var worstUpdateTime = 0;
		var worstDrawTime = 0;
		
		window.setInterval(function () {
			var updateStart = Date.now();
			update(keyboard);
			var updateTime = Date.now() - updateStart;
			if (updateTime > worstUpdateTime) {
				worstUpdateTime = updateTime;
				console.log("Slowest update: " + worstUpdateTime + " ms");
			}
			keyboard.update();
			requestAnimationFrame(function() {
				var drawStart = Date.now();
				draw(painter);
				var drawTime = Date.now() - drawStart;
				if (drawTime > worstDrawTime) {
					worstDrawTime = drawTime;
					console.log("Slowest draw: " + worstDrawTime + " ms");
				}


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