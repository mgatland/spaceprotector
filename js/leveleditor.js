require(["keyboard", "painter", "level", "sprites", "spritedata", "colors"],
	function (Keyboard, Painter, Level, Sprites, SpriteData, Colors) {

	mapData =
		"OOOOO\n" +
		"O   O\n" +
		"O O O\n" +
		"O   O\n" +
		"OOOOO\n" +
		"";

	var tileSize = 10;
	var pixelSize = 4;
	var level = new Level(mapData, tileSize);
	var canvas = document.querySelector(".gamescreen");
	var ctx = canvas.getContext('2d');
	var cameraPos = {x:0,y:0};
	var keyboard = new Keyboard();
	var mouseDown = false;
	var showCells = true;

	var brushNum = 0;
	var brushes = [];
	brushes.push({code:" ", spriteData: null});
	brushes.push({code:"O", spriteData: null});
	brushes.push({code:"p", spriteData: SpriteData.player});
	brushes.push({code:"m", spriteData: SpriteData.shooter});
	brushes.push({code:"k", spriteData: SpriteData.walker});
	brushes.push({code:"x", spriteData: SpriteData.crate});
	brushes.push({code:"!", spriteData: SpriteData.flag});
	brushes.push({code:"@", spriteData: SpriteData.end});

	brushes.forEach(function (brush) {
		if (brush.spriteData) {
			brush.sprite = Sprites.loadFramesFromData(brush.spriteData)[0];
		}
	});

	function updateBrush (n) {
		brushNum = (brushNum + n) % brushes.length;
		if (brushNum < 0) brushNum = brushes.length - 1;
	}

	function getBrush() {
		return brushes[brushNum];
	}

	var tick = function() {
		canvas.width = window.innerWidth - 30;
		canvas.height = window.innerHeight / 4 * 3;

		if (keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT)) cameraPos.x--;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT)) cameraPos.x++;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_UP)) cameraPos.y--;
		if (keyboard.isKeyDown(KeyEvent.DOM_VK_DOWN)) cameraPos.y++;

		if (keyboard.isKeyHit(KeyEvent.DOM_VK_L)) {
			loadMap();
		}

		if (keyboard.isKeyHit(KeyEvent.DOM_VK_S)) {
			saveMap(mapData);
		}

		if (keyboard.isKeyHit(KeyEvent.DOM_VK_Z)) {
			updateBrush(-1);
		}
		if (keyboard.isKeyHit(KeyEvent.DOM_VK_X)) {
			updateBrush(1);
		}

		if (keyboard.isKeyHit(KeyEvent.DOM_VK_P)) showCells = !showCells;


		keyboard.update();

		var painter = new Painter(ctx, canvas, pixelSize);
		painter.clear();
		painter.setPos(cameraPos);
		level.draw(painter);
		var x = 0;
		var y = 0;
		for (var i = 0; i < mapData.length; i++) {
			var c = mapData[i];
			if (c === "\n") {
				y++;
				x = 0;
			} else {
				//find the appropriate brush
				brushes.forEach(function (b) {
					if (b.code === c && b.sprite) {
					painter.drawSprite2(
						x*tileSize,
						y*tileSize,
						12, null, b.sprite, Colors.good);
					}
				});
				if (showCells && c === "O") {
					painter.drawRect(x * tileSize, y * tileSize,
						tileSize, tileSize, Colors.background);
				}
				x++;
			}
		}

		//draw current brush in the corner
		var brush = getBrush();
		if (brush.sprite) {
			painter.drawSprite2(0, 0, 12, null, 
				brush.sprite, Colors.highlight, true);
		} else if (brush.code === " ") {
			painter.drawAbsRect(0, 0, 12, 12, Colors.highlight, 1);
		} else if (brush.code === "O") {
			painter.drawAbsRect(0, 0, 12, 12, Colors.highlight);
		}

		requestAnimationFrame(tick);

	}

	function getMapPosFromScreenPos(screenX, screenY) {
		var canvasOffset = getDomElementOffset(canvas);
		var x = Math.floor((screenX - canvasOffset.left) / tileSize / pixelSize + cameraPos.x / tileSize);
		var y = Math.floor((screenY - canvasOffset.top) / tileSize / pixelSize + cameraPos.y / tileSize);
		return {x:x, y:y};
	}

	var setMapCell = function (x, y, value) {
		lines = mapData.split("\n");

		while (lines.length <= y) {
			lines.push("");
		}

		if (lines[y] !== undefined) {
			if (lines[y].length <= x) {
				lines[y] = lines[y] + new Array(x-lines[y].length+1).join(" ");
			}
			lines[y] = lines[y].slice(0, x) + value + lines[y].slice(x+1);
			mapData = lines.join("\n");
			level = new Level(mapData, tileSize);
		}

	}

	var paintAtEvent = function (event) {
		event.preventDefault();

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

	function loadMap () {
		var data = prompt("Enter map data: ");
		if (data) {
			mapData = data.replace(/\\n/g, "\n");
			console.log(mapData + " loaded");
			level = new Level(mapData, tileSize);
		} else {
			alert("Invalid data string.");
		}
	}

	function saveMap () {
		console.log(mapData + " saved");
		setOutput(mapData.replace(/\n/g, "\\n"));
	}

	function setOutput(text) {
		document.querySelector('.output').innerHTML = text;
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

	updateBrush(0);
	window.requestAnimationFrame(tick);
});
