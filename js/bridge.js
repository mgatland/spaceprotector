"use strict";
define(["keyboard", "touch", "painter", "leveleditor", "audio"], 
	function (Keyboard, Touch, Painter, LevelEditor, audio) {

	//Bridge links the game to the browser.
	//It deals with browser-related functionality like when the page is resized.
	var Bridge = function (pixelWindow, minSize, desiredFps) {

		var scale = 4;

		var gameTime = null;
		var frameDelay = 1000/desiredFps;

		var worstUpdateTime = 0;
		var worstDrawTime = 0;
		var worstFPS = 999;
		var thisSecond = null;
		var framesThisSecond = 0;
		var borderThickness = 4;

		var limitScreenSize = false;


		var canvas = document.getElementById('gamescreen');

		console.log("initGame");

		var gameArea = document.querySelector('.gamecontainer');
		var htmlBody = document.body;
		var widthToHeight = pixelWindow.width / pixelWindow.height;

		var painter;
		this.createPainter = function () {
			var ctx = canvas.getContext("2d");
			painter = new Painter(ctx, pixelWindow, scale);
			return painter;
		};

		this.createTouch = function () {
			return new Touch(gameArea, pixelWindow, scale); 
		};

		this.createKeyboard = function (touch) {
			return new Keyboard(touch); 
		};

		this.createLevelEditor = function (camera, Events, keyboard) {
			var canvas = document.getElementById('gamescreen');
			return new LevelEditor(camera, Events, keyboard, canvas, scale);
		}

		this.resetWorstStats = function () {
			worstUpdateTime = 0;
			worstDrawTime = 0;
			worstFPS = 999;
		}

		this.showGame = function (update, draw) {
			//http://www.html5rocks.com/en/tutorials/
			//	casestudies/gopherwoord-studios-resizing-html5-games/
			var resizeGame = function() {

				var xScale = window.innerWidth/minSize.width;
				var yScale = window.innerHeight/minSize.height;
				scale = Math.floor(Math.min(xScale, yScale));

				var newWidth = Math.floor(window.innerWidth / scale);
				var newHeight = Math.floor(window.innerHeight / scale);
				pixelWindow.width = newWidth;
				pixelWindow.height = newHeight;
				gameArea.style.width = newWidth*scale;
				gameArea.style.height = newHeight*scale;

				canvas.width = newWidth*scale;
				canvas.height = newHeight*scale;

				/*font size must be a multiple of 3*/
				var fontScale = (newWidth*scale / minSize.width);
				var fontSize = Math.floor(fontScale*18/4/3)*3; 
				if (fontSize < 6) fontSize = 6;
				htmlBody.style.fontSize = fontSize + "px";

				painter.resize(scale);
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

			function runAndBenchmark(func, logFunc) {
				var startTime = Date.now();
				func();
				logFunc(Date.now() - startTime);
			}

			function tick(timestamp) {
				if (gameTime === null || gameTime < timestamp - frameDelay * 3) {
					gameTime = timestamp - 1; //first frame of the game.
					//Or: First frame after pausing the game for a while
					console.log("(Re)starting game timing");
				}

				var frames = 0;
				while (gameTime < timestamp) {
					frames++;
					gameTime += frameDelay;
					runAndBenchmark(update, logUpdateTime);
				}

				/*TODO: log frame skipping\inserting less verbosely
				if (frames != 1) {
					console.log("Unusual ticks per frame: " + frames);
				}*/

				runAndBenchmark(draw, logDrawTime);
				logFPS();
				requestAnimationFrame(tick);
			}

			window.addEventListener('resize', resizeGame, false);
			window.addEventListener('orientationchange', resizeGame, false);
			resizeGame();
			gameArea.classList.remove("hide");
			requestAnimationFrame(tick);

			var muteButton = document.getElementById('mute-button');
			var unmuteButton = document.getElementById('unmute-button');
			muteButton.addEventListener('click', audio.mute);
			unmuteButton.addEventListener('click', audio.unmute);

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
