"use strict";
define(["keyboard", "painter", "level", "sprites", "spritedata", "colors"],
	function (Keyboard, Painter, Level, Sprites, SpriteData, Colors) {

	var LevelEditor = function (camera, Events, keyboard, canvas, pixelSize) {

		var level = null;
		var tileSize = 10;
		var mouseDown = false;
		var camTarget = camera.getTargetPos();

		var brushNum = 0;
		var brushes = [];
		brushes.push({code:0, spriteData: null});
		brushes.push({code:1, spriteData: null});
		brushes.push({code:"p", spriteData: SpriteData.player});
		brushes.push({code:"m", spriteData: SpriteData.shooter});
		brushes.push({code:"k", spriteData: SpriteData.walker});
		brushes.push({code:"x", spriteData: SpriteData.crate});
		brushes.push({code:"!", spriteData: SpriteData.flag});
		brushes.push({code:"@", spriteData: SpriteData.end});
		brushes.push({code:"b", spriteData: SpriteData.blockMonster});
		brushes.push({code:"w", spriteData: SpriteData.wasp});
		brushes.push({code:"s", spriteData: SpriteData.spring});
		brushes.push({code:"f", spriteData: SpriteData.wolf});

		brushes.forEach(function (brush) {
			if (brush.spriteData) {
				brush.sprite = Sprites.loadFramesFromData(brush.spriteData)[0];
			}
		});

		function setBrushNum (n) {
			brushNum = n % brushes.length;
			if (brushNum < 0) brushNum = brushes.length - 1;
		}

		function updateBrush (n) {
			brushNum = (brushNum + n) % brushes.length;
			if (brushNum < 0) brushNum = brushes.length - 1;
		}

		function getBrush() {
			return brushes[brushNum];
		}

		//duplicate code from touch.js
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

		function getCanvasPosFromScreenPos(screenX, screenY) {
			var canvasOffset = getDomElementOffset(canvas);
			var x = Math.floor((screenX - canvasOffset.left) / pixelSize);
			var y = Math.floor((screenY - canvasOffset.top) / pixelSize);
			return {x:x, y:y};
		}

		function getMapPosFromScreenPos(screenX, screenY) {
			var canvasOffset = getDomElementOffset(canvas);
			var x = Math.floor((screenX - canvasOffset.left) / tileSize / pixelSize + camera.pos.x / tileSize);
			var y = Math.floor((screenY - canvasOffset.top) / tileSize / pixelSize + camera.pos.y / tileSize);
			return {x:x, y:y};
		}

		var setMapCell = function (x, y, value) {
			if (!level) return;
			console.log("Setting " + x + ", " + y + ", " + value);

			//remove existing spawner at that location
			level.setSpawners(
				level.getSpawners().filter(function (s) {
					return s.x != x || s.y != y
				}));
			if (value === 0 || value === 1) {
				level.setCell(x, y, value);
			} else {
				level.setCell(x, y, 0);
				level.getSpawners().push({x:x, y:y, type:value});
			}

			console.log("spawner count: " + level.getSpawners().length);

		}

		var paintAtEvent = function (event) {
			event.preventDefault();

			var screenPos = getCanvasPosFromScreenPos(event.clientX, event.clientY);

			//are we clicking on the UI buttons?
			if (screenPos.y < tileSize && mouseDown) {
				//-1 for an off-by-one error, which we should really fix
				//elsewhere as it probs affects every click and touch as well
				var brushNum = Math.floor((screenPos.x - 1) / tileSize);
				setBrushNum(brushNum);
				return;
			}

			//otherwise, paint on the map

			if (!mouseDown && !event.shiftKey) {
				return;
			}

			var pos = getMapPosFromScreenPos(event.clientX, event.clientY);
			setMapCell(pos.x, pos.y, getBrush().code);
		}

		canvas.addEventListener('mousedown', function (event) {
			console.log("Mouse down");
			mouseDown = true;
			paintAtEvent(event);
		});

		canvas.addEventListener('mouseup', function (event) {
			mouseDown = false;
		});

		canvas.addEventListener('mousemove', paintAtEvent);

		this.setLevel = function (newLevel) {
			level = newLevel;
		}

		this.activated = function () {
			camTarget = camera.getTargetPos();
		}

		this.deactivated = function () {
			Events.restart();
		}

		this.update = function (keys) {
			//ignore keys, use the more powerful keyboard
			if (keyboard.isKeyHit(KeyEvent.DOM_VK_A)) {
				updateBrush(-1);
			}
			if (keyboard.isKeyHit(KeyEvent.DOM_VK_D)) {
				updateBrush(1);
			}
			if (keyboard.isKeyHit(KeyEvent.DOM_VK_S)) {
				console.log(level.toString());
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_R)) {
				level.eraseAll();
			}

			if (keyboard.isKeyDown(KeyEvent.DOM_VK_UP)) {
				camTarget.y -= 5;
			}
			if (keyboard.isKeyDown(KeyEvent.DOM_VK_DOWN)) {
				camTarget.y += 5;
			}
			if (keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT)) {
				camTarget.x -= 5;
			}
			if (keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT)) {
				camTarget.x += 5;
			}
			camera.jumpTo(camTarget.x, camTarget.y);
		}

		this.draw = function (painter) {
			if (!level) return;
			level.draw(painter, true);
			var spawners = level.getSpawners();
			spawners.forEach(function (s) {
				brushes.forEach(function (b) {
					if (b.code === s.type) {
						painter.drawSprite2(
						s.x * tileSize,
						s.y * tileSize,
						12, null, b.sprite, Colors.good);
					}
				});
			});

			for (var i = 0; i < brushes.length; i++) {
				var brush = brushes[i];
				var color = (i === brushNum) ? Colors.highlight : Colors.good;
				if (brush.sprite) {
					painter.drawSprite2(i*tileSize, 0, 12, null, 
						brush.sprite, color, true);
				} else if (brush.code === 0) {
					painter.drawAbsRect(i*tileSize, 0, 10, 10, color, 1);
				} else if (brush.code === 1) {
					painter.drawAbsRect(i*tileSize, 0, 10, 10, color);
				}
			}
		}
		updateBrush(0);
	};

	return LevelEditor;

});
