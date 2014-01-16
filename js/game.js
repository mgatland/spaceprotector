"use strict";
(function() {

	window.initGame = function () {

		var man = {};
		man.pos = new Pos(10,70);
		man.size = new Pos(5,5);
		man.state = "falling";

		var mapData =
		"O                 O\n" +
		"O                 O\n" +
		"O                 O\n" +
		"O                 O\n" +
		"O                 O\n" +
		"O                 O\n" +
		"O                OO\n" +
		"OOOOOOO    OO   OOO\n" +
		"OOOOOOO    OO  OOOO\n" +
		" OOOOOOOOOOOOOOOOOO\n";

		var map = [];

		var loadMap = function (mapData) {
			map = [];
			var n = 0;
			var x = 0;
			var y = 0;
			map[y] = [];
			while (mapData[n]) {
				if (mapData[n]==="O") {
					map[y][x] = 1;
				}
				if (mapData[n] === "\n") {
					x = 0;
					y++;
					map[y] = [];
				} else {
					x++;
				}
				n++;
			}
		}
		loadMap(mapData);


		man.isOnGround = function () {
			return this.pos.y >= 90;
		}

		var update = function(keyboard) {
			var left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
			var right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
			var up = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
			var upHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

			if (left && !right) {
				man.pos.x--;
			} else if (right && !left) {
				man.pos.x++;
			}

			if (upHit && man.isOnGround()) {
				man.state = "jumping";
				man.jumpTime = 0;
				man.jumpPhase = 1;
			}

			if (man.state === "jumping") {
				if (man.jumpPhase === 1) {
					man.pos.y -= 2;
				} else if (man.jumpPhase === 2) {
					man.pos.y -= 1;
				}

				man.jumpTime++;
				if (man.jumpPhase === 1 && man.jumpTime > 3) {
					man.jumpPhase = 2;
					man.jumpTime = 0;
				}
				if (man.jumpPhase === 2 && man.jumpTime > 5 && (!up || man.jumpTime > 14)) {
					man.jumpPhase = 3;
					man.jumpTime = 0;
				}
				if (man.jumpPhase === 3 && man.jumpTime > 5) {
					man.state = "falling";
				}

			} else if (!man.isOnGround()) {
				man.pos.y += 1;
			}
		}

		var man0 =
		"  1  \n" +
		" 111 \n" +
		"1 1 1\n" +
		" 1 1 \n" +
		" 1 1 \n";

		var draw = function (painter) {
			painter.clear();
			painter.drawSprite(man.pos.x,man.pos.y, man0, "#FFFF00");

			map.forEach(function (row, y) {
				row.forEach(function (value, x) {
					if (value === 1) {
						painter.drawSquare(x*10,y*10, "#FFFF00");
					}
				});
			});
		}

        var pixelWindow = {width:192, height:104};
        var scale = 4;

        var desiredFps = 60;
		new Bridge().showGame(update, draw, pixelWindow, scale, desiredFps);
	}
})();

