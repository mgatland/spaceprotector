"use strict";
define(["entity", "level", "camera", "levelpack"],
	function (Entity, Level, Camera, LevelPack) {

	var mapData = new LevelPack().mapData;

	//TODO: Events is only passed in so we can access changes made
	//by the Level initialization. Let's change that, let level
	//push changes directly to the game state.
	var PlayingState = function (Events, camera, levelNum) {
		this.showTouchButtons = true;

		var tileSize = 10;

		var level = new Level(mapData[levelNum % mapData.length], tileSize);
		var netFramesToSkip = 0;
		var netFrame = netFramesToSkip;
		var ticks = 0;
		var tickDurationInSeconds = 1/60; //FIXME: derive from Framerate

		//todo: think about how level transitions are replicated
		var winTimer = 0;
		var maxWinTimer = 25;
		var winAnimationPlaying = false;
		var winStats = null;

		//game state:
		var GameState = function () {
			this.shots = [];
			this.explosions = [];
			this.players = [];
			this.local = 0;
			this.other = 1;
			this.monsters = [];
		};
		var gs = new GameState();

		function moveElementsTo(dest, source) {
			Array.prototype.push.apply(dest, source);
			source.length = 0;	
		}

		var processEvents = function (Events) {
			moveElementsTo(gs.shots, Events.shots);
			moveElementsTo(gs.monsters, Events.monsters);
			moveElementsTo(gs.explosions, Events.explosions);
			moveElementsTo(gs.players, Events.players);
		};

		var initialize = function () {
				//Hacks to make the player start on the ground
				//with the camera correctly positioned.
				gs.players[gs.local].tryMove(0, 10);
				gs.players[gs.local].groundedY = gs.players[gs.local].pos.y;
				camera.jumpTo(gs.players[gs.local].pos.x, gs.players[gs.local].groundedY);			
		};

		this.update = function (keys, Network, Events) {
			if (Events.isRestarting) {
				Events.isRestarting = false;
				//hack: don't reset the player position
				var tempPos = gs.players[gs.local].pos;
				gs = new GameState;
				level.spawnEntities(tempPos);
			}

			ticks++;

			processEvents(Events);

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

			if (Network.networkRole === Network.HOST) {
				gs.local = 0;
				gs.other = 1;
				gs.players[1].hidden = false;
			} else if (Network.networkRole === Network.GUEST) {
				gs.local = 1;
				gs.other = 0;
				gs.players[1].hidden = false;
			} else {
				gs.players[1].hidden = true;
			}
			gs.players[gs.local].update(keys);

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
				monster.update(gs);
			});

			camera.panTowards(gs.players[gs.local].pos.x, gs.players[gs.local].groundedY);

			if (Events.wonLevel && !winAnimationPlaying) {
				winAnimationPlaying = true;
				this.endStats = this.getStats();
				this.showTouchButtons = false;
			}
			if (winAnimationPlaying) {
				winTimer++;
				if (winTimer === maxWinTimer) {
					//FIXME: Events.wonLevel can leak into the next level
					//making you instantly win it. Currently to prevent it you
					//have to clear Events.wonLevel after all other updates
					//before transitioning to the next level.
					Events.wonLevel = false;
					this.transition = true;
				}
			}
		};

		this.draw = function (painter) {

			painter.setPos(camera.pos); //only needs to be set once per level

			var drawOne = function (x) { x.draw(painter);}			

			gs.monsters.forEach(drawOne);
			gs.players.forEach(drawOne);
			gs.shots.forEach(drawOne);
			gs.explosions.forEach(drawOne);
			level.draw(painter);

			if (winTimer > 0) {
				painter.drawWinTransition(winTimer/maxWinTimer);
			}
		};

		this.gotData = function (data) {
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
		};

		this.getStats = function () {
			return {
				deaths: gs.players[gs.local].getDeaths(),
				time: ticks * tickDurationInSeconds,
				mercy: gs.monsters.filter(
					function (f) {return f.live && f.killIsCounted;}
					).length
			};
		}

		//for level editor only
		this.getLevel = function () {
			return level;
		}

		processEvents(Events);
		initialize();
	};

	return PlayingState;
});