"use strict";
require(["util", "bridge", "keyboard", "network", "lib/peer"], function(util) {
	(function() {

		window.initGame = function () {

			var gotData = function (data) {
				if (data.x !== undefined && data.y !== undefined) {
					mans[other].pos.x = data.x;
					mans[other].pos.y = data.y;
					mans[other].dir = data.dir == 0 ? Dir.LEFT : Dir.RIGHT;
					if (data.shot === 1) mans[other]._shoot();
				} else {
					console.log("Weird data: " + data);
				}
			}
			Network.connectToServer(gotData);

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

			var Man = function () {
				this.pos = new Pos(50,10);
				this.size = new Pos(5,5);
				this.state = "falling";
				this.canJump = true;
				this.fallingTime = 0;
				this.loading = 0;
				this.refireRate = 15;
				this.dir = Dir.RIGHT;
				this.shotThisFrame = false;

				this.isOnGround = function () {
					var leftFoot = isPointColliding(this.pos.clone().moveXY(0,this.size.y), map);
					var rightFoot = isPointColliding(this.pos.clone().moveXY(this.size.x-1,this.size.y), map);
					return (leftFoot || rightFoot);
				}

				this.tryMove = function (x, y) {
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

				this._shoot = function () {
					shots.push(new Shot(this.pos.clone(), this.dir));
				}

				this.update = function (left, right, shoot, shootHit, jump, jumpHit) {

					if (this.loading > 0) this.loading--;

					if (shootHit || shoot && this.loading === 0) {
						this.loading = this.refireRate;
						this._shoot();
						this.shotThisFrame = true;
					} else {
						this.shotThisFrame = false;
					}

					if (left && !right) {
						this.dir = Dir.LEFT;
						this.tryMove(-1,0);
					} else if (right && !left) {
						this.dir = Dir.RIGHT;
						this.tryMove(1,0);
					}

					if (this.isOnGround()) {
						this.fallingTime = 0;
						this.canJump = true;
					}

					if (jumpHit && this.canJump) { // this means you can walk off a cliff and still jump for 3 frames
						this.state = "jumping";
						this.canJump = false;
						this.jumpTime = 0;
						this.jumpPhase = 1;
					}

					if (this.state === "jumping") {
						var speed = 0;
						if (this.jumpPhase === 1) {
							speed = -2;
						} else if (this.jumpPhase === 2) {
							speed = -1;
						}
						var unblocked = this.tryMove(0, speed);

						this.jumpTime++;
						if (this.jumpPhase === 1 && this.jumpTime > 3) {
							this.jumpPhase = 2;
							this.jumpTime = 0;
						}
						if (this.jumpPhase === 2 && this.jumpTime > 5 && (!jump || this.jumpTime > 15)) {
							this.jumpPhase = 3;
							this.jumpTime = 0;
						}
						if (!unblocked && this.jumpPhase != 3) {
							this.jumpPhase = 3;
							this.jumpTime = 0;
						}
						if (this.jumpPhase === 3 && this.jumpTime > 6) {
							this.state = "falling";
							this.fallingTime = 6; //Hack so the player can't recover from this fallingness.
						}

					} else if (!this.isOnGround()) {
						this.fallingTime++;
						if (this.fallingTime >= 3) {
							var speed = this.fallingTime < 10 ? 1 : 2;
							this.tryMove(0,speed);
							this.canJump = false;
						}
					}
				}
			}

			var mans = [];
			mans.push(new Man());
			mans.push(new Man());
			var local = 0;
			var other = 1;

			var netFramesToSkip = 0;
			var netFrame = netFramesToSkip;

			var update = function(keyboard) {

				shots.forEach(function (shot) {shot.update();});

				var left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
				var right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
				var jump = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
				var jumpHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

				var shoot = keyboard.isKeyDown(KeyEvent.DOM_VK_C) || keyboard.isKeyDown(KeyEvent.DOM_VK_Z);
				var shootHit = keyboard.isKeyHit(KeyEvent.DOM_VK_C) || keyboard.isKeyHit(KeyEvent.DOM_VK_Z);

				if (Network.networkRole === Network.HOST) {
					local = 0;
					other = 1;
				} else if (Network.networkRole === Network.CLIENT) {
					local = 1;
					other = 0;
				}
				mans[local].update(left, right, shoot, shootHit, jump, jumpHit);
				if (netFrame === 0) {
					var netData = {x:mans[local].pos.x, y:mans[local].pos.y, dir:mans[local].dir == Dir.LEFT ? 0 : 1};
					if (mans[local].shotThisFrame === true) netData.shot = 1;
					Network.send(netData);
					netFrame = netFramesToSkip;
				} else {
					netFrame--;
				}
				//mans[other].update();
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
				mans.forEach(function (man) {
					painter.drawSprite(man.pos.x,man.pos.y, manSprite0, "#FFFF00");
				});

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