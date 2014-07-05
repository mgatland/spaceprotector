"use strict";
require(["util", "player", "level", "events", "colors",
	"network", "pos", "bridge", "entity",
	"lib/peer", "shot", "explosion", "monster", "audio"], 
	function(util, Player, Level, Events, Colors, Network, Pos, Bridge, Entity) {
	var initGame = function () {

		var gotData = function (data) {
			if (data.player !== undefined) {
				gs.players[gs.other].fromData(data.player);
				if (gs.players[gs.other].shotThisFrame) gs.players[gs.other]._shoot();

				if (data.monsters !== undefined) {
					gs.monsters.forEach(function (monster, index) {
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

		//game state:
		var gs = {
			shots: [],
			explosions: [],
			players: [],
			local: 0,
			other: 1,
			monsters: []
		};
		gs.players.push(new Player(level, new Pos(40, 90)));
		gs.players.push(new Player(level, new Pos(50, 90)));

		var netFramesToSkip = 0;
		var netFrame = netFramesToSkip;

		var winTimer = 0; //TODO: move into game state

		function moveElementsTo(dest, source) {
			Array.prototype.push.apply(dest, source);
			source.length = 0;	
		}

		var update = function(keyboard, painter) {

			if (Events.wonLevel) {
				winTimer++;
			}

			moveElementsTo(gs.shots, Events.shots);
			moveElementsTo(gs.monsters, Events.monsters);
			moveElementsTo(gs.explosions, Events.explosions);

			//Process collisions
			//Shots collide with monsters and players
			gs.shots.forEach(function (shot) {
				if (shot.live === true) {
					if (shot.hitsMonsters === true) {
						gs.monsters.forEach(function (monster) {
							Entity.checkCollision(shot, monster);
						});
					} else {
						gs.players.forEach(function (player) {
							Entity.checkCollision(shot, player);
						});
					}
				}
			});
			//Enemies collide with players
			//(only notify the player)
			gs.players.forEach(function (p) {
				gs.monsters.forEach(function (monster) {
					Entity.checkCollision(p, monster, "firstOnly");
				});
			});

			gs.shots.forEach(function (shot) {shot.update();});
			gs.explosions.forEach(function (exp) {exp.update();});

			var left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
			var right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
			var jump = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
			var jumpHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

			var shoot = keyboard.isKeyDown(KeyEvent.DOM_VK_Y) || keyboard.isKeyDown(KeyEvent.DOM_VK_Z);
			var shootHit = keyboard.isKeyHit(KeyEvent.DOM_VK_Y) || keyboard.isKeyHit(KeyEvent.DOM_VK_Z);

			if (Network.networkRole === Network.HOST) {
				gs.local = 0;
				gs.other = 1;
			} else if (Network.networkRole === Network.CLIENT) {
				gs.local = 1;
				gs.other = 0;
			}
			gs.players[gs.local].update(left, right, shoot, shootHit, jump, jumpHit);
			if (netFrame === 0) {
				var netData = {};
				netData.player = gs.players[gs.local].toData();

				if (Network.networkRole === Network.HOST) {
					netData.monsters = [];
					gs.monsters.forEach(function (monster, index) {
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

			gs.monsters.forEach(function (monster) {
				monster.update();
			});

			painter.setPos(gs.players[gs.local].pos.x, gs.players[gs.local].groundedY);
		}

		var draw = function (painter) {
			painter.clear();

			var drawOne = function (x) { x.draw(painter);}

			gs.monsters.forEach(drawOne);
			gs.players.forEach(drawOne);
			gs.shots.forEach(drawOne);
			gs.explosions.forEach(drawOne);
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

	initGame();
});