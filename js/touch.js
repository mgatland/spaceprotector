"use strict";
define(["colors", "fullscreen", "audio", "sprites", "dir"], 
	function (Colors, Fullscreen, Audio, Sprites, Dir) {
	var Touch = function (canvas, pixelWindow, pixelSize) {

		var spriteData = 
		"v1.0:000000000000000000000000000010000000000100000000001000000000011111111000001000000000000100000000000010000000000000000000000000000000000000000000000000000000000000000000000000100000000000010000000000001000001111111100000000001000000000010000000000100000000000000000000000000000000000000000000001000000000011100000000101010000001001001000000001000000000001000000000001000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000111000111111111100000000111000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111100000000000000011111111100000000000000011111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
		var sprites = Sprites.loadFramesFromData(spriteData);

		var hasBeenUsed = false;
		var visible = false;
		//callbacks
		var onKeyDown = null;
		var onKeyUp = null;

		var oldKeys = []; //keys from last frame that are no longer down
		var buttons = [];

		buttons.push({x:10, y:90, w:19, h:13, sprite:sprites[0],
			dx:0, dy:50, dw:29, dh:80,
			key:KeyEvent.DOM_VK_LEFT});

		buttons.push({x:30, y:90, w:19, h:13, sprite:sprites[1],
			dx:30, dy:50, dw:59, dh:80,
			key:KeyEvent.DOM_VK_RIGHT});

		buttons.push({x:140, y:90, w:19, h:13, sprite:sprites[2],
			dx:90, dy:50, dw:69, dh:80,
			key:KeyEvent.DOM_VK_X});

		buttons.push({x:160, y:90, w:19, h:13, sprite:sprites[3],
			dx:160, dy:50, dw:49, dh:80, 
			key:KeyEvent.DOM_VK_Z});

		//Hack for the menus - tapping anywhere counts as pressing enter
		buttons.push({x:0, y:0, w:0, h:0, sprite:null,
			dx:0, dy:0, dw:9000, dh:9000, 
			key:KeyEvent.DOM_VK_ENTER});

		buttons.push({x:-1, y:-1, w:13, h:11, sprite:sprites[4],
			dx:0, dy:0, dw:29, dh:29, color: Colors.bad,
			key:KeyEvent.DOM_VK_ESCAPE});

		//http://mobiforge.com/design-development/html5-mobile-web-touch-events
		function getDomElementOffset(obj) {
		  var offsetLeft = 0;
		  var offsetTop = 0;
		  do {
		    if (!isNaN(obj.offsetLeft)) {
		      offsetLeft += obj.offsetLeft;
		    }
		    if (!isNaN(obj.offsetTop)) {
		      offsetTop += obj.offsetTop;
		    }	  
		  } while(obj = obj.offsetParent );
		  return {left: offsetLeft, top: offsetTop};
		}

		function getTouchPosWithOffset(touch, offset) {
			var x = touch.pageX - offset.left;
			var y = touch.pageY - offset.top;
			return {x:x, y:y};
		}

		function getButtonTouchArea(canvas, button) {
			var x = button.dx * canvas.offsetWidth / pixelWindow.width;
			var y = button.dy * canvas.offsetHeight / pixelWindow.height;
			var w = button.dw * canvas.offsetWidth / pixelWindow.width;
			var h = button.dh * canvas.offsetHeight / pixelWindow.height;
			return {x:x, y:y, w:w, h:h};
		}

		function updateTouches(touches) {
			var canvasOffset = getDomElementOffset(canvas); 

			var keysDown = [];
			buttons.forEach(function (button) {
				var scaled = getButtonTouchArea(canvas, button);
				button.active = false;
				for (var i = 0; i < touches.length; i++) {
					var touch = touches[i];
					var pos = getTouchPosWithOffset(touch, canvasOffset);
					if (pos.x > scaled.x && pos.x < scaled.x + scaled.w &&
						pos.y > scaled.y && pos.y < scaled.y + scaled.h) {
						button.active = true;
					}
				}
				if (button.active) {
					keysDown.push(button.key);
					onKeyDown(button.key);
					var index = oldKeys.indexOf(button.key);
					if (index > -1) oldKeys.splice(index, 1);
				}
			});

			oldKeys.forEach(function (code) { onKeyUp(code); });
			oldKeys = keysDown;
		}

		function onFirstTouch () {
			hasBeenUsed = true;
			visible = true;
			Audio.unmuteIOSHack();
			Fullscreen.goFullscreenIfRequired(canvas, pixelWindow, pixelSize);
		}

		function touchStart (e) {
			if (!hasBeenUsed) {
				onFirstTouch();
			}
			e.preventDefault();
			updateTouches(e.touches);
		}

		function touchEnd (e) {
			e.preventDefault();
			updateTouches(e.touches);
		}

		function touchMove (e) {
			e.preventDefault();
			updateTouches(e.touches);
		}

		this.setCallbacks = function (onDown, onUp) {
			onKeyDown = onDown;
			onKeyUp = onUp;
		}

		this.draw = function (painter) {
			if (!visible) return;
			buttons.forEach(function (button) {
				var color = button.color ? button.color: Colors.background;
				color = button.active ? Colors.good: color;
				painter.drawAbsRect(button.x, button.y, button.w, button.h, 
					Colors.blank);
				painter.drawAbsRect(button.x, button.y, button.w, button.h, 
					color, 1);
				if (button.sprite) {
					var sX = button.x + Math.floor(button.w / 2) - 5;
					var sY = button.y + Math.floor(button.h / 2) - 5;
					painter.drawSprite2(sX, sY, 10, Dir.RIGHT,
					button.sprite, color, true);
				}
			});
		}

		canvas.addEventListener('touchstart', touchStart);
		canvas.addEventListener('touchend', touchEnd);
		canvas.addEventListener('touchmove', touchMove);

		function noBubble(e) {
			e.stopPropagation();
		}

		document.querySelector("#instructions").addEventListener('touchstart', noBubble);
		document.querySelector("#instructions").addEventListener('touchend', noBubble);
		document.querySelector("#instructions").addEventListener('touchmove', noBubble);
	};
	return Touch;
});
