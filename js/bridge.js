"use strict";
define(["audio"], function (Audio) {
	var Painter = function (ctx, pixelWindow, pixelSize) {
		var backgroundColor = "#000000";
		var pos = new Pos(0,0);

		var cameraSlackX = pixelWindow.width/8;
		var cameraSlackY = 0;

		var moveTowards = function(desired, slack, axis, slack2, slack3) {
			var distance = desired - pos[axis];
			var dir = distance ? distance < 0 ? -1:1:0;
			var distanceAbs = Math.abs(distance);
			if (distanceAbs > slack) pos[axis] += dir;
			if (slack2 && distanceAbs > slack2) pos[axis] += dir*2;
			if (slack3 && distanceAbs > slack3) pos[axis] += dir*3;
		}

		this.setPos = function (x, y) {
			moveTowards(x - pixelWindow.width/2, cameraSlackX, "x", cameraSlackX*2, cameraSlackX*4);
			moveTowards(y - pixelWindow.height/2, cameraSlackY, "y", pixelWindow.height/2, pixelWindow.height);
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

		this.drawAbsRect= function (x, y, width, height, color) {
			ctx.fillStyle = color;
			ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize*width, pixelSize*height);
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
		this.showGame = function (update, draw, updateAudio, pixelWindow, scale, desiredFps) {
		console.log("initGame");
		var keyboard = new Keyboard();

		var canvas = document.getElementById('gamescreen');
		canvas.width = pixelWindow.width*scale;
		canvas.height = pixelWindow.height*scale;
		var ctx = canvas.getContext("2d");

		var painter = new Painter(ctx, pixelWindow, scale);

		var gameTime = null;
		var frameDelay = 1000/desiredFps;

		var worstUpdateTime = 0;
		var worstDrawTime = 0;
		var worstFPS = 999;
		var thisSecond = null;
		var framesThisSecond = 0;

		var resetWorstStats = function () {
			worstUpdateTime = 0;
			worstDrawTime = 0;
			worstFPS = 999;
		}

		var logUpdateTime = function (duration) {
			if (duration > worstUpdateTime) {
				worstUpdateTime = duration;
				console.log("Slowest update: " + worstUpdateTime + " ms");
			}
		}

		var logDrawTime = function (duration) {
			if (duration > worstDrawTime) {
				worstDrawTime = duration;
				console.log("Slowest draw: " + worstDrawTime + " ms");
			}
		}

		var logFPS = function () {
			var newSecond = Math.floor(Date.now() / 1000);
			if (newSecond != thisSecond) {
				thisSecond = newSecond;
				if (framesThisSecond < worstFPS && framesThisSecond != 0) {
					worstFPS = framesThisSecond;
					console.log("worst FPS: " + framesThisSecond);
				}
				framesThisSecond = 0;
			}
			framesThisSecond++;
		}

		//arguments: logging function, function, function arguments...
		function runAndBenchmark(logFunc, func) {
			var startTime = Date.now();
			var extraArgs = Array.prototype.slice.call(arguments, 2);
			func.apply(null, extraArgs);
			logFunc(Date.now() - startTime);
		}

		function tick(timestamp) {
			if (gameTime === null || gameTime < timestamp - frameDelay * 3) {
				gameTime = timestamp - 1; //first frame of the game.
				//Or: First frame after pausing the game for a while
				console.log("(Re)starting game timing");
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_P)) resetWorstStats();

			var frames = 0;
			while (gameTime < timestamp) {
				frames++;
				gameTime += frameDelay;
				runAndBenchmark(logUpdateTime, update, keyboard, painter);
				keyboard.update();
			}

			/*TODO: log frame skipping\inserting less verbosely
			if (frames != 1) {
				console.log("Unusual ticks per frame: " + frames);
			}*/

			runAndBenchmark(logDrawTime, draw, painter);
			updateAudio(Audio, painter);
			logFPS();
			requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);

		}
	}
	return Painter;
});