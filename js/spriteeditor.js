"use strict";
require(["sprites", "keyboard"], function (Sprites, Keyboard) {

	var Pixels = function (size) {
		var _this = this;
		var pixelsEl = document.querySelector('.pixels');
		var data = [];
		var el = [];

		var painting = null;
		var mouseDown = false;

		var initData = function () {
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					data[y*size+x] = 0;
				}
			}
		};

		initData();

		for (var y = 0; y < size; y++) {
			el[y] = [];
			for (var x = 0; x < size; x++) {
				var iDiv = document.createElement('div');
				iDiv.className = 'pixel';
				iDiv.x = x;
				iDiv.y = y;
				pixelsEl.appendChild(iDiv);
				el[y][x] = iDiv;
			}
			var iDiv = document.createElement('br');
			pixelsEl.appendChild(iDiv);
		}

		var drawAtEvent = function (event) {
			event.preventDefault();

			if (!mouseDown) {
				return;
			}

			var pixel = event.target;
			if (typeof pixel.x === "number") {
				if (painting === null) {
					var oldValue = getCellValue(pixel.x, pixel.y);
					painting = (oldValue === 1) ? 0 : 1;
				}
				setCellValue(pixel.x, pixel.y, painting);
				updateCellDisplay(pixel.x, pixel.y);
			}
		}

		pixelsEl.addEventListener('mousedown', function (event) {
			mouseDown = true;
			drawAtEvent(event);
		});

		pixelsEl.addEventListener('mouseup', function (event) {
			mouseDown = false;
			painting = null;
		});

		pixelsEl.addEventListener('mousemove', drawAtEvent);

		var getCellValue = function(x, y) {
			return data[y*size+x];
		}

		var setCellValue = function (x, y, color) {
			data[y*size+x] = color;	
		}

		var getColor = function (num) {
			if (num === 0) return "black";
			return "red";
		}

		var updateCellDisplay = function (x, y) {
			el[y][x].style.backgroundColor = getColor(data[y*size+x]);
		}

		var updateDisplay = function () {
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					updateCellDisplay(x, y);
				}
			}	
		}

		this.getData = function () {
			return data;
		}

		this.setData = function (newData) {
			if (!newData || newData.length === 0) {
				initData();
			} else {
				data = newData;
			}
			updateDisplay();
		}
	}


	var start = function () {
		var size = 12;
		var maxFrames = 12;
		var pixels = new Pixels(size);
		var frames = [];

		for (var i = 0; i < maxFrames; i++) {
			frames[i] = [];
		}

		var currentFrame = 0;
		var maxAnims = 1;
		var animFrame = 0;
		var animFrameDelay = 0;
		var pixelSize = 4;

		var clipBoard = [];

		var keyboard = new Keyboard();

		var canvas = document.querySelector('canvas.frames');
		canvas.width = size * (frames.length + maxAnims) * pixelSize;
		canvas.height = size * pixelSize;
		var ctx = canvas.getContext("2d");


		var backgroundColor = "black";
		var color = "red";

		var clear = function() {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		var drawPixel = function (x, y, frame, color) {
			ctx.fillStyle = color;
			ctx.fillRect(x * pixelSize + frame * size * pixelSize, y * pixelSize, pixelSize, pixelSize);
		}

		var drawFrame = function (data, position) {
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					drawPixel(x, y, position, data[y*size+x] === 1 ? "red": "black");
				}
			}
		}

		var save = function (frames) {
			var data = "v1.0:";
			frames.forEach(function (frame) {
				frame.forEach(function (val) {
					data = data + val;
				});
			});
			document.getElementById("alerts").innerHTML = data;
		}

		window.setInterval(function () {
			clear();

			var data = pixels.getData();
			frames[currentFrame] = data.slice(); //inefficient
			for (var frameN = 0; frameN < frames.length; frameN++) {
				var frame = frames[frameN];
				drawFrame(frame, frameN);
			}

			var anims = document.querySelector(".anims").value.split(",");
			var maxAnimFrameDelay = parseInt(document.querySelector(".frameDelay").value);
			if (animFrame >= anims.length) {
				animFrame = 0;
			}
			var anim = anims[animFrame].split(":");
			var frame = frames[anim[0]];
			if (frame) {
				drawFrame(frame, maxFrames);
			}
			animFrameDelay--;
			if (animFrameDelay <= 0 || isNaN(animFrameDelay)) {
				animFrame++;
				animFrameDelay = maxAnimFrameDelay;
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_C)) {
				clipBoard = data.slice();
				console.log("Copy");
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_V)) {
				pixels.setData(clipBoard.slice());
				console.log("Paste");
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_HYPHEN_MINUS)) {
				currentFrame--;
				if (currentFrame < 0) currentFrame = maxFrames - 1;
				pixels.setData(frames[currentFrame].slice());
				console.log("Frame " + currentFrame);
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_EQUALS)) {
				currentFrame++;
				if (currentFrame === maxFrames) currentFrame = 0;
				pixels.setData(frames[currentFrame].slice());
				console.log("Frame " + currentFrame);
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_L)) {
				var data = prompt("Enter v1.0 data string: ");
				if (data && data.indexOf("v1.0:") === 0) {
					var newFrames = Sprites.loadFramesFromData(data);
					newFrames.forEach(function (frame, index) {
						frames[index] = frame;
					});
					pixels.setData(frames[currentFrame]);
				} else {
					alert("Invalid data string.");
				}
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_S)) {
				save(frames);
			}

			keyboard.update();	
		}, 1000/60);
	}

	if (document.readyState !== "loading") {
		start();
	} else {
		document.addEventListener("DOMContentLoaded", function(event) {
			start();
		});
	}
});