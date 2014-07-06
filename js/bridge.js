"use strict";
define(["audio", "keyboard", "touch", "painter"], 
	function (Audio, Keyboard, Touch, Painter) {

	var Bridge = function () {
		this.showGame = function (update, draw, updateAudio, pixelWindow, scale, desiredFps) {
		console.log("initGame");

		var gameArea = document.querySelector('.gamecontainer');
		var htmlBody = document.body;
		var widthToHeight = pixelWindow.width / pixelWindow.height;

		var canvas = document.getElementById('gamescreen');
		canvas.width = pixelWindow.width*scale;
		canvas.height = pixelWindow.height*scale;
		var ctx = canvas.getContext("2d");

		var painter = new Painter(ctx, pixelWindow, scale);

		var touch = new Touch(gameArea, pixelWindow, scale);
		var keyboard = new Keyboard(touch);

		var gameTime = null;
		var frameDelay = 1000/desiredFps;

		var worstUpdateTime = 0;
		var worstDrawTime = 0;
		var worstFPS = 999;
		var thisSecond = null;
		var framesThisSecond = 0;
		var borderThickness = 4;

		//http://www.html5rocks.com/en/tutorials/
		//	casestudies/gopherwoord-studios-resizing-html5-games/
		var resizeGame = function() {
			var newWidth = window.innerWidth;
			var newHeight = window.innerHeight;

			if (newWidth > pixelWindow.width * scale + borderThickness * 2
				&& newHeight > pixelWindow.height * scale + borderThickness * 2) {
				//We're on a large screen. Draw at proper size.
				newWidth = pixelWindow.width * scale + borderThickness * 2;
				newHeight = pixelWindow.height * scale + borderThickness * 2;
				gameArea.style.width = newWidth;
				gameArea.style.height = newHeight;
			} else {
				var newWidthToHeight = newWidth / newHeight;
				if (newWidthToHeight > widthToHeight) {
				  newWidth = newHeight * widthToHeight;
				} else {
				  newHeight = newWidth / widthToHeight;
				}
				gameArea.style.height = newHeight + 'px';
				gameArea.style.width = newWidth + 'px';
			}

			//Center
			gameArea.style.marginTop = (-newHeight / 2) + 'px';
			gameArea.style.marginLeft = (-newWidth / 2) + 'px';

			/*font size must be a multiple of 3*/
			var fontScale = (newWidth / pixelWindow.width);
			var fontSize = Math.floor(fontScale*18/scale/3)*3; 
			if (fontSize < 6) fontSize = 6;
			htmlBody.style.fontSize = fontSize + "px";

		}

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

			runAndBenchmark(logDrawTime, draw, painter, touch);
			updateAudio(Audio, painter);
			logFPS();
			requestAnimationFrame(tick);
		}

		window.addEventListener('resize', resizeGame, false);
		window.addEventListener('orientationchange', resizeGame, false);
		resizeGame();
		gameArea.classList.remove("hide");
		requestAnimationFrame(tick);


    //iOS Safari 7.1 has a bug, in full screen mode it lets you
    //scroll past the end of the page. Rotating can trigger it.
    //this workaround scrolls you back to the top.
    var scrollToTop = function () {
        if (window.pageYOffset > 0) {
            window.scrollTo(0, 0);
        }
    }
    window.addEventListener('orientationchange', scrollToTop);
    window.addEventListener('scroll', scrollToTop);
		}
	}
	return Bridge;
});
