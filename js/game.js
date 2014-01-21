"use strict";

var Events = new function () {
	this.shots = [];
	this.shoot = function (shot) {
		this.shots.push(shot);
	}
};

require(["util", "bridge", "keyboard", "network", "lib/peer", "level", "shot", "player", "monster"], function(util) {
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

			var checkCollision = function (a, b) {
				if (a.pos.x < b.pos.x + b.size.x
					&& a.pos.x + a.size.x > b.pos.x
					&& a.pos.y < b.pos.y + b.size.y
					&& a.pos.y + a.size.y > b.pos.y
					) {
					a.collisions.push(b);
					b.collisions.push(a);
				}
			}

			var shots = [];
			Events.shoot(new Shot(level, new Pos(20,50), Dir.RIGHT));

			var players = [];
			players.push(new Player(level, new Pos(30, 70)));
			players.push(new Player(level, new Pos(50, 70)));
			var local = 0;
			var other = 1;

			var monsters = [];
			monsters.push(new Monster(level, 30, 70));

			var netFramesToSkip = 0;
			var netFrame = netFramesToSkip;

			var update = function(keyboard) {

				//Pull new shots from the event system
				Array.prototype.push.apply(shots, Events.shots);
				Events.shots.length = 0;

				//Process collisions
				//Shots and enemies
				shots.forEach(function (shot) {
					if (shot.live === true) {
						monsters.forEach(function (monster) {
							checkCollision(shot, monster);
						});
					}
				});


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

			var shotSprite0 = "111111\n";

			var draw = function (painter) {
				painter.setPos(players[local].pos.x, players[local].groundedY);
				painter.clear();
				players.forEach(function (player) {
					player.draw(painter);
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