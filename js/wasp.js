"use strict";
define(["sprites", "spritedata", "util", "monster", "pos", "events", "dir"], 
	function (Sprites, SpriteData, Util, Monster, Pos, Events, Dir) {
	var sprites = Sprites.loadFramesFromData(SpriteData.wasp);
	var anims = {
		flying: {frames: [0,1,2,3,4,5], delay: 6},
		sleeping: {frames: [6,7,7], delay: 30}
	};

	var Wasp = function (level, x, y) {
		var _this = this;

		//constants
		var initialHealth = 1;
		var moveDelay = 1;
		var vMoveRatio = 3;
		var seeDistance = 10*5;
		var speed = 1;
		var maxWakefulness = 20;

		//state
		var moveTimer = 0;
		var vMoveTimer = 0;
		var action = "waiting";
		var hAim = 0;
		var vAim = 0;
		var wakefulness = 0;

		var onHit = function (collisions) {
		}

		function getTarget (gs) {
			var target = null;
			var dist = null;
			gs.players.forEach(function (player) {
				if (!player.hidden) {
					var distToPlayer = _this.pos.distanceTo(player.pos);
					if (target === null || distToPlayer < dist) {
						target = player;
						dist = distToPlayer;
					}
				}
			});
			return target;
		}

		var ai = function (gs) {
			if (action === "waiting") {
				var disturbed = false;
				gs.players.forEach(function (player) {
					if (!player.hidden && player.pos.y > _this.pos.y
						&& _this.pos.distanceTo(player.pos) < seeDistance) {
						disturbed = true;
					}
				});
				if (disturbed) {
					wakefulness++;
					if (wakefulness >= maxWakefulness) {
						action = "moving";
						_this.startAnimation("flying");
						Events.playSound("waspstart", _this.pos.clone());					
					}
				}
			}
			if (action === "moving") {
				if (moveTimer >= moveDelay) {
					moveTimer = 0;
					var target = getTarget(gs);

					if (target) {
						if (target.pos.x > _this.pos.x) {
							hAim++;
							if (hAim > 5) hAim = 5;
						} else {
							hAim--;
							if (hAim < -5) hAim = -5;
						}
						if (hAim > 0) {
							_this.dir = Dir.RIGHT;

						} else {
							_this.dir = Dir.LEFT;
						}
						_this.tryMove(_this.dir.x*speed,_this.dir.y*speed);

						vMoveTimer++;
						if (vMoveTimer===vMoveRatio) {
							vMoveTimer = 0;
							if (target.pos.y > _this.pos.y + 7) {
								vAim++;
								if (vAim > 5) vAim = 5;
							} else {
								vAim--;
								if (vAim < -5) vAim = -5;
							}
							if (vAim > 0) {
								_this.tryMove(0, 1);
							} else {
								_this.tryMove(0, -1);
							}
						}
					}
				} else {
					moveTimer++;
				}
			}
		}

		this.toData = function () {
			var data = this.monsterToData();
			data.moveTimer = moveTimer;
			data.vMoveTimer = vMoveTimer;
			data.hAim = hAim;
			data.vAim = vAim;
			data.action = action;
			data.wakefulness = wakefulness;
			return data;
		}

		this.fromData = function (data) {
			this.monsterFromData(data);
			moveTimer = data.moveTimer;
			vMoveTimer = data.vMoveTimer;
			hAim = data.hAim;
			vAim = data.vAim;
			action = data.action;
			wakefulness = data.wakefulness;
		}

		Util.extend(this, new Monster(level, x, y, 10, 10, sprites, anims, ai, initialHealth, onHit));
		this.startAnimation("sleeping");
	}
	return Wasp;
});