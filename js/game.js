"use strict";
(function() {

	window.initGame = function () {

		var tileSize = 10;

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

		var isPointColliding = function (pos, map) {
			var x = Math.floor(pos.x / tileSize);
			var y = Math.floor(pos.y / tileSize);
			if (map[y][x] === 1) return true;
			return false;
		}

		var isColliding = function (man, map) {
			//find out which cell each corner is in.
			//If a corner is inside a solid square, return true.
			var corner = man.pos.clone();
			if (isPointColliding(corner, map)) return true;
			if (isPointColliding(corner.moveXY(man.size.x-1,0), map)) return true;
			if (isPointColliding(corner.moveXY(0,man.size.y-1), map)) return true;
			if (isPointColliding(corner.moveXY(-man.size.x+1,0), map)) return true;
			return false;
		}

		var man = {};
		man.pos = new Pos(50,10);
		man.size = new Pos(5,5);
		man.state = "falling";

		man.isOnGround = function () {
			var leftFoot = isPointColliding(this.pos.clone().moveXY(0,this.size.y), map);
			var rightFoot = isPointColliding(this.pos.clone().moveXY(this.size.x-1,this.size.y), map);
			return (leftFoot || rightFoot);
		}

		man.tryMove = function (x, y) {
			while (x != 0) {
				var sign = x > 0 ? 1 : -1;
				this.pos.x += sign;
				x -= sign;
				if (isColliding(this, map)) {
					this.pos.x -= sign;
					x = 0; //no more movement.
				}
			}
			while (y != 0) {
				var sign = y > 0 ? 1 : -1;
				this.pos.y += sign;
				y -= sign;
				if (isColliding(this, map)) {
					this.pos.y -= sign;
					y = 0; //no more movement.
				}
			}
		}

		var update = function(keyboard) {
			var left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
			var right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
			var up = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
			var upHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

			if (left && !right) {
				man.tryMove(-1,0);
			} else if (right && !left) {
				man.tryMove(1,0);
			}

			if (upHit && man.isOnGround()) {
				man.state = "jumping";
				man.jumpTime = 0;
				man.jumpPhase = 1;
			}

			if (man.state === "jumping") {
				if (man.jumpPhase === 1) {
					man.tryMove(0,-2);
				} else if (man.jumpPhase === 2) {
					man.tryMove(0,-1);
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
				man.tryMove(0,1);
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
						painter.drawSquare(x*tileSize,y*tileSize, "#FFFF00");
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

