"use strict";

var Events = new function () {
	this.shots = [];
	this.monsters = [];
	this.wonLevel = false;
	this.sounds = [];
	this.explosions = [];
	this.shoot = function (shot) {
		this.shots.push(shot);
	}
	this.monster = function (m) {
		this.monsters.push(m);
	}
	this.winLevel = function () {
		if (this.wonLevel) return;
		this.wonLevel = true;
		Events.playSound("winlevel", null);
	}
	this.playSound = function (name, pos) {
		this.sounds.push({name: name, pos:pos});
	}
	this.explosion = function (exp) {
		this.explosions.push(exp);
	}
};

var Colors = {
	background: "#5CCCCC", bad: "#8598FF", good: "#B2FFFF", highlight: "#FFFFFF"
};

require(["util", "player", "level", "bridge", "keyboard", "network", 
	"lib/peer", "shot", "explosion", "monster", "audio"], 
	function(util, Player, Level) {
	(function() {
		window.initGame = function () {

			var gotData = function (data) {
				if (data.player !== undefined) {
					players[other].fromData(data.player);
					if (players[other].shotThisFrame) players[other]._shoot();

					if (data.monsters !== undefined) {
						monsters.forEach(function (monster, index) {
							var monsterData = data.monsters[index];
							if (monsterData) {
								monster.fromData(data.monsters[index]);
							}
						});
					}
				} else {
					console.log("Weird data: ", data);
				}
			}
			Network.connectToServer(gotData);

			var tileSize = 10;

			var mapData =
			"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO   x                      O           O\n" +
			"O !    m      O ! O m O m O   O   x !                    O           O\n" +
			"O OOO OOO OOO O O O O O O O O O OOOOOOOOOOOOOOOO  OOO  OOO    @      O\n" +
			"O OOO OOO OOO k O m O   O   O   OOOO                   OOO    OO     O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO                  OOOO    OO  m  O\n" +
			"O O                                O               m OOOOO        OO O\n" +
			"O O                                            OOOOOOOOOOO     m  OO O\n" +
			"O O                    ! O    m       ! OO  k  O              OO     O\n" +
			"O O   !  OOO OO  k    OOOO    OOO    OOOOOOOOOOO          m   OO     O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOO OOO  k OOOOOOOOOOO         OO          O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO      m  OO   !      O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO     OO      OO      O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO   m OO      OO      O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO  OO                 O\n" +
			"O  !                 O       x mm            !    OO                 O\n" +
			"O  O   m O  m O  k O !       x OO           OOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"O  OOOOOOOOOOOOOOOOOOO    OOOO OO OOOO OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n";

			var level = new Level(mapData, tileSize);

			//mode tells who to nofity, "both" or "firstonly"
			var checkCollision = function (a, b, mode) {
				if (!mode) mode = "both";
				if (a.live === true && b.live === true
					&& a.pos.x < b.pos.x + b.size.x
					&& a.pos.x + a.size.x > b.pos.x
					&& a.pos.y < b.pos.y + b.size.y
					&& a.pos.y + a.size.y > b.pos.y
					) {
					a.collisions.push(b);
					if (mode === "both") b.collisions.push(a);
				}
			}

			var shots = [];
			var explosions = [];
			var players = [];
			players.push(new Player(level, new Pos(40, 90)));
			players.push(new Player(level, new Pos(50, 90)));
			var local = 0;
			var other = 1;

			var monsters = [];

			var netFramesToSkip = 0;
			var netFrame = netFramesToSkip;

			var winTimer = 0; //TODO: move into game state

			var update = function(keyboard, painter) {

				if (Events.wonLevel) {
					winTimer++;
				}

				//Pull new shots from the event system
				Array.prototype.push.apply(shots, Events.shots);
				Events.shots.length = 0;

				Array.prototype.push.apply(monsters, Events.monsters);
				Events.monsters.length = 0;

				Array.prototype.push.apply(explosions, Events.explosions);
				Events.explosions.length = 0;

				//Process collisions
				//Shots collide with monsters and players
				shots.forEach(function (shot) {
					if (shot.live === true) {
						if (shot.hitsMonsters === true) {
							monsters.forEach(function (monster) {
								checkCollision(shot, monster);
							});
						} else {
							players.forEach(function (player) {
								checkCollision(shot, player);
							});
						}
					}
				});
				//Enemies collide with players
				//(only notify the player)
				players.forEach(function (p) {
					monsters.forEach(function (monster) {
						checkCollision(p, monster, "firstOnly");
					});
				});

				shots.forEach(function (shot) {shot.update();});
				explosions.forEach(function (exp) {exp.update();});

				var left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
				var right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
				var jump = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
				var jumpHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

				var shoot = keyboard.isKeyDown(KeyEvent.DOM_VK_Y) || keyboard.isKeyDown(KeyEvent.DOM_VK_Z);
				var shootHit = keyboard.isKeyHit(KeyEvent.DOM_VK_Y) || keyboard.isKeyHit(KeyEvent.DOM_VK_Z);

				if (Network.networkRole === Network.HOST) {
					local = 0;
					other = 1;
				} else if (Network.networkRole === Network.CLIENT) {
					local = 1;
					other = 0;
				}
				players[local].update(left, right, shoot, shootHit, jump, jumpHit);
				if (netFrame === 0) {
					var netData = {};
					netData.player = players[local].toData();

					if (Network.networkRole === Network.HOST) {
						netData.monsters = [];
						monsters.forEach(function (monster, index) {
							if (monster.isNetDirty) {
								netData.monsters[index] = monster.toData();	
								monster.isNetDirty = false;
							}
						});
					}
					Network.send(netData);
					netFrame = netFramesToSkip;
				} else {
					netFrame--;
				}

				monsters.forEach(function (monster) {
					monster.update();
				});

				painter.setPos(players[local].pos.x, players[local].groundedY);
			}

			var draw = function (painter) {
				painter.clear();

				var drawOne = function (x) { x.draw(painter);}

				monsters.forEach(drawOne);
				players.forEach(drawOne);
				shots.forEach(drawOne);
				explosions.forEach(drawOne);
				drawOne(level);

				if (winTimer > 0) {
					var barHeight = Math.min(winTimer*2, 45);
					var barY = winTimer * 2;
					painter.drawAbsRect(0, pixelWindow.height/2-barY, pixelWindow.width, barHeight, Colors.good);
					painter.drawAbsRect(0, pixelWindow.height/2+barY-barHeight, pixelWindow.width, barHeight, Colors.good);
				}
			}

			var updateAudio = function (audio, painter) {
				Events.sounds.forEach(function (sound) {
					if (sound.pos === null || painter.isOnScreen(sound.pos.x, sound.pos.y, 10, 10)) {
						audio.play(sound.name);
					}
				});
				Events.sounds.length = 0;
			}

      var pixelWindow = {width:192, height:104}; //I could fit 200 x 120 on Galaxy s3 at 4x pixel scale
      var scale = 4;

      var desiredFps = 60;
			new Bridge().showGame(update, draw, updateAudio, pixelWindow, scale, desiredFps);
		}
	})();

	initGame();
});