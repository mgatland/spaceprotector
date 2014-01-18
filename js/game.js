"use strict";
require(["util", "bridge", "keyboard", "network", "lib/peer"], function(util) {
	(function() {

		window.initGame = function () {

			connectToServer();

			var tileSize = 10;

			var mapData =
			"O                 O\n" +
			"O                 O\n" +
			"O                 O\n" +
			"O  O  O  O  O   OOO\n" +
			"O                 O\n" +
			"OO                O\n" +
			"O                OO\n" +
			"OOOOOOO    OO   OOO\n" +
			"OOOOOOO    OO  OOOO\n" +
			"OOOOOOOOOOOOOOOOOOO\n";

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

			var Shot = function (pos, dir) {
				this.pos = pos;
				this.dir = dir;

				this.size = new Pos(5,1);

				this.pos.moveXY(2,1);
				this.live = true;

				if (dir === Dir.LEFT) {
					this.pos.moveXY(-8, 0);
				} else {
					this.pos.moveXY(3, 0);
				}
				this.update = function () {
					if (this.live === false) return;
					this.pos.moveInDir(this.dir, 2);
					var left = isPointColliding(this.pos, map);
					var right = isPointColliding(this.pos.clone().moveXY(this.size.x,0), map);
					if (left || right) {
						//destroy it
						this.live = false;
					}
				}
			}

			var shots = [];
			shots.push(new Shot(new Pos(20,20), Dir.RIGHT));

			var man = {};
			man.pos = new Pos(50,10);
			man.size = new Pos(5,5);
			man.state = "falling";
			man.canJump = true;
			man.fallingTime = 0;
			man.loading = 0;
			man.refireRate = 15;
			man.dir = Dir.RIGHT;

			man.isOnGround = function () {
				var leftFoot = isPointColliding(this.pos.clone().moveXY(0,this.size.y), map);
				var rightFoot = isPointColliding(this.pos.clone().moveXY(this.size.x-1,this.size.y), map);
				return (leftFoot || rightFoot);
			}

			man.tryMove = function (x, y) {
				var ok = true;
				while (x != 0) {
					var sign = x > 0 ? 1 : -1;
					this.pos.x += sign;
					x -= sign;
					if (isColliding(this, map)) {
						this.pos.x -= sign;
						x = 0; //no more movement.
						ok = false;
					}
				}
				while (y != 0) {
					var sign = y > 0 ? 1 : -1;
					this.pos.y += sign;
					y -= sign;
					if (isColliding(this, map)) {
						this.pos.y -= sign;
						y = 0; //no more movement.
						ok = false;
					}
				}
				return ok;
			}

			var update = function(keyboard) {

				shots.forEach(function (shot) {shot.update();});

				var left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
				var right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
				var up = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
				var upHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

				var shoot = keyboard.isKeyDown(KeyEvent.DOM_VK_C) || keyboard.isKeyDown(KeyEvent.DOM_VK_Z);
				var shootHit = keyboard.isKeyHit(KeyEvent.DOM_VK_C) || keyboard.isKeyHit(KeyEvent.DOM_VK_Z);

				if (man.loading > 0) man.loading--;

				if (shootHit || shoot && man.loading === 0) {
					man.loading = man.refireRate;
					shots.push(new Shot(man.pos.clone(), man.dir));
				}

				if (left && !right) {
					man.dir = Dir.LEFT;
					man.tryMove(-1,0);
				} else if (right && !left) {
					man.dir = Dir.RIGHT;
					man.tryMove(1,0);
				}

				if (man.isOnGround()) {
					man.fallingTime = 0;
					man.canJump = true;
				}

				if (upHit && man.canJump) { // this means you can walk off a cliff and still jump for 3 frames
					man.state = "jumping";
					man.canJump = false;
					man.jumpTime = 0;
					man.jumpPhase = 1;
				}

				if (man.state === "jumping") {
					var speed = 0;
					if (man.jumpPhase === 1) {
						speed = -2;
					} else if (man.jumpPhase === 2) {
						speed = -1;
					}
					var unblocked = man.tryMove(0, speed);

					man.jumpTime++;
					if (man.jumpPhase === 1 && man.jumpTime > 3) {
						man.jumpPhase = 2;
						man.jumpTime = 0;
					}
					if (man.jumpPhase === 2 && man.jumpTime > 5 && (!up || man.jumpTime > 15)) {
						man.jumpPhase = 3;
						man.jumpTime = 0;
					}
					if (!unblocked && man.jumpPhase != 3) {
						man.jumpPhase = 3;
						man.jumpTime = 0;
					}
					if (man.jumpPhase === 3 && man.jumpTime > 6) {
						man.state = "falling";
						man.fallingTime = 6; //Hack so the player can't recover from this fallingness.
					}

				} else if (!man.isOnGround()) {
					man.fallingTime++;
					if (man.fallingTime >= 3) {
						var speed = man.fallingTime < 10 ? 1 : 2;
						man.tryMove(0,speed);
						man.canJump = false;
					}
				}
			}

			var manSprite0 =
			"  1  \n" +
			" 111 \n" +
			"1 1 1\n" +
			" 1 1 \n" +
			" 1 1 \n";

			var shotSprite0 = "111111\n";

			var draw = function (painter) {
				painter.clear();
				painter.drawSprite(man.pos.x,man.pos.y, manSprite0, "#FFFF00");

				shots.forEach(function (shot) {
					if (shot.live) painter.drawSprite(shot.pos.x, shot.pos.y, shotSprite0, "#FFFF00");
				});

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

	initGame();
});