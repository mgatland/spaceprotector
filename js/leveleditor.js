define(["keyboard", "painter", "level", "sprites", "spritedata", "colors"],
	function (Keyboard, Painter, Level, Sprites, SpriteData, Colors) {

	var LevelEditor = function (camera, canvas, pixelSize) {

		var level = null;
		var tileSize = 10;
		var mouseDown = false;

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

			/*lines = mapData.split("\n");

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
			}*/
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

		this.setLevel = function (newLevel) {
			level = newLevel;
		}

		this.update = function (keyboard) {
			if (keyboard.isKeyHit(KeyEvent.DOM_VK_A)) {
				updateBrush(-1);
			}
			if (keyboard.isKeyHit(KeyEvent.DOM_VK_D)) {
				updateBrush(1);
			}
		}

		this.draw = function (painter) {
			if (!level) return;
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

			var brush = getBrush();
			if (brush.sprite) {
				painter.drawSprite2(0, 0, 12, null, 
					brush.sprite, Colors.highlight, true);
			} else if (brush.code === 0) {
				painter.drawAbsRect(0, 0, 12, 12, Colors.highlight, 1);
			} else if (brush.code === 1) {
				painter.drawAbsRect(0, 0, 12, 12, Colors.highlight);
			}
		}

		updateBrush(0);
	};

	return LevelEditor;

/*	mapData =
		"OOOOO\n" +
		"O   O\n" +
		"O O O\n" +
		"O   O\n" +
		"OOOOO\n" +
		"";

	var level = new Level(mapData, tileSize);
	var showCells = true;

	var tick = function() {
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

		if (keyboard.isKeyHit(KeyEvent.DOM_VK_P)) showCells = !showCells;

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
	}

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
	}*/
});
