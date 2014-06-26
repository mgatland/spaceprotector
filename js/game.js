"use strict";

var Events = new function () {
	this.shots = [];
	this.monsters = [];
	this.shoot = function (shot) {
		this.shots.push(shot);
	}
	this.monster = function (m) {
		this.monsters.push(m);
	}
};

var Colors = {
	background: "#5CCCCC", bad: "#8598FF", good: "#B2FFFF", highlight: "#FFFFFF"
};

require(["util", "player", "bridge", "keyboard", "network", "lib/peer", "level", "shot", "monster"], function(util, Player) {
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
			"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO   x                      O           O\n" +
			"O     m       O   O m O m O   O   x                      O           O\n" +
			"O OO OOO OOOO O O O O O O O O O OOOOOOOOOOOOOOOO  OOO  OOO           O\n" +
			"O OO OOO OOOO k O m O   O   O   OOOO                   OOO    OO     O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO                  OOOO    OO  m  O\n" +
			"O O                                O               m OOOOO        OO O\n" +
			"O O                                            OOOOOOOOOOO     m  OO O\n" +
			"O O                      O    m         OO  k  O              OO     O\n" +
			"O O      OOO OO  k    OOOO    OOO    OOOOOOOOOOO          m   OO     O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOO OOO  k OOOOOOOOOOO         OO          O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO      m  OO          O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO     OO      OO      O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO   m OO      OO      O\n" +
			"O OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO  OO                 O\n" +
			"O                    O       x mm                 OO                 O\n" +
			"O  O   m O  m O  k O         x OO   OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
			"O  OOOOOOOOOOOOOOOOOOO    OOOO OO  OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n" +
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
			Events.shoot(new Shot(level, new Pos(20,50), Dir.RIGHT)); //test shot

			var players = [];
			players.push(new Player(level, new Pos(40, 90)));
			players.push(new Player(level, new Pos(50, 90)));
			var local = 0;
			var other = 1;

			var monsters = [];

			var netFramesToSkip = 0;
			var netFrame = netFramesToSkip;

			var update = function(keyboard, painter) {

				//Pull new shots from the event system
				Array.prototype.push.apply(shots, Events.shots);
				Events.shots.length = 0;

				Array.prototype.push.apply(monsters, Events.monsters);
				Events.monsters.length = 0;

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

				painter.setPos(players[local].pos.x, players[local].groundedY);
			}

			var shotSprite0 = "111111\n";

			var draw = function (painter) {
				painter.clear();

				monsters.forEach(function (monster) {
					monster.draw(painter);
				});

				players.forEach(function (player) {
					player.draw(painter);
				});

				shots.forEach(function (shot) {
					if (shot.live) {
						painter.drawSprite(shot.pos.x, shot.pos.y, shotSprite0, shot.hitsMonsters ? Colors.good : Colors.bad);
					}
				});

				level.draw(painter);
			}

	        var pixelWindow = {width:192, height:104}; //I could fit 200 x 120 on Galaxy s3 at 4x pixel scale
	        var scale = 4;

	        var desiredFps = 60;
			new Bridge().showGame(update, draw, pixelWindow, scale, desiredFps);
		}
	})();

	initGame();
});