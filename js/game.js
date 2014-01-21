"use strict";
require(["util", "bridge", "keyboard", "network", "lib/peer", "level", "monster"], function(util) {
	(function() {

		window.initGame = function () {

			var gotData = function (data) {
				if (data.x !== undefined && data.y !== undefined) {
					players[other].pos.x = data.x;
					players[other].pos.y = data.y;
					players[other].dir = data.dir == 0 ? Dir.LEFT : Dir.RIGHT;
					if (data.shot === 1) players[other]._shoot();
				} else {
					console.log("Weird data: " + data);
				}
			}
			Network.connectToServer(gotData);

			var tileSize = 10;

			var mapData =
			"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"O                 OOOO\n" +
			"O                 OOOOOOOOOOOOOOO\n" +
			"O                    O          O\n" +
			"O  O  O  O  O   OOO  O          O\n" +
			"O                 O  O          OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"OO                O                                            O\n" +
			"O                OOOOOOOOO                                     O\n" +
			"OOOOOOO    OO   OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO              O\n" +
			"OOOOOOO    OO  OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n";

			var level = new Level(mapData, tileSize);

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
					var left = level.isPointColliding(this.pos);
					var right = level.isPointColliding(this.pos.clone().moveXY(this.size.x,0));
					if (left || right) {
						//destroy it
						this.live = false;
					}
				}
			}

			var shots = [];
			shots.push(new Shot(new Pos(20,20), Dir.RIGHT));

			var Player = function () {
				extend(this, new WalkingThing(level, new Pos(50,10), new Pos(5,5)));
				this.state = "falling";
				this.canJump = true;
				this.fallingTime = 0;
				this.loading = 0;
				this.refireRate = 15;
				this.dir = Dir.RIGHT;
				this.shotThisFrame = false;
				this.groundedY = this.pos.y;

				this.isOnGround = function () {
					var leftFoot = level.isPointColliding(this.pos.clone().moveXY(0,this.size.y));
					var rightFoot = level.isPointColliding(this.pos.clone().moveXY(this.size.x-1,this.size.y));
					return (leftFoot || rightFoot);
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

					if (this.isOnGround() || this.pos.y > this.groundedY) {
						this.groundedY = this.pos.y;
					}
				}
			}

			var players = [];
			players.push(new Player());
			players.push(new Player());
			var local = 0;
			var other = 1;

			var monsters = [];
			monsters.push(new Monster(level, 30, 70));

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
				players[local].update(left, right, shoot, shootHit, jump, jumpHit);
				if (netFrame === 0) {
					var netData = {x:players[local].pos.x, y:players[local].pos.y, dir:players[local].dir == Dir.LEFT ? 0 : 1};
					if (players[local].shotThisFrame === true) netData.shot = 1;
					Network.send(netData);
					netFrame = netFramesToSkip;
				} else {
					netFrame--;
				}

				monsters.forEach(function (monster) {
					monster.update();
				});
			}

			var playerSprite0 =
			"  1  \n" +
			" 111 \n" +
			"1 1 1\n" +
			" 1 1 \n" +
			" 1 1 \n";

			var shotSprite0 = "111111\n";

			var draw = function (painter) {
				painter.setPos(players[local].pos.x, players[local].groundedY);
				painter.clear();
				players.forEach(function (player) {
					painter.drawSprite(player.pos.x, player.pos.y, playerSprite0, "#FFFF00");
				});

				monsters.forEach(function (monster) {
					monster.draw(painter);
				});

				shots.forEach(function (shot) {
					if (shot.live) painter.drawSprite(shot.pos.x, shot.pos.y, shotSprite0, "#FFFF00");
				});

				level.draw(painter);
			}

	        var pixelWindow = {width:192, height:104};
	        var scale = 4;

	        var desiredFps = 60;
			new Bridge().showGame(update, draw, pixelWindow, scale, desiredFps);
		}
	})();

	initGame();
});