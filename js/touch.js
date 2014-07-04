"use strict";
define(["colors"], function (Colors) {
	var Touch = function (canvas, pixelWindow, pixelSize) {

		var visible = true;
		//callbacks
		var onKeyDown = null;
		var onKeyUp = null;

		var oldKeys = []; //keys from last frame that are no longer down
		var buttons = [];

		buttons.push({x:10, y:80, w:19, h:20, 
			dx:0, dy:80, dw:29, dh:20,
			key:KeyEvent.DOM_VK_LEFT});

		buttons.push({x:30, y:80, w:19, h:20,
			dx:30, dy:80, dw:59, dh:20,
			key:KeyEvent.DOM_VK_RIGHT});

		buttons.push({x:140, y:80, w:19, h:20,
			dx:90, dy:80, dw:69, dh:20,
			key:KeyEvent.DOM_VK_Z});

		buttons.push({x:160, y:80, w:19, h:20,
			dx:160, dy:80, dw:49, dh:20, 
			key:KeyEvent.DOM_VK_X});

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
					//ignore y - all buttons are infinitely tall
					if (pos.x > scaled.x && pos.x < scaled.x + scaled.w) {
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

		function touchStart (e) {
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
				painter.drawAbsRect(button.x, button.y, button.w, button.h, 
					button.active ? Colors.good: Colors.background, 1);
			});
		}

		this.hide = function () {
			visible = false;
		}

		canvas.addEventListener('touchstart', touchStart);
		canvas.addEventListener('touchend', touchEnd);
		canvas.addEventListener('touchmove', touchMove);
	};
	return Touch;
});
