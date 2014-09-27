"use strict"
define(["sprites", "spritedata", "util", "monster"], 
	function (Sprites, SpriteData, Util, Monster) {
	var sprites = Sprites.loadFramesFromData(SpriteData.blockMonster);
	var anims = {
		idle: {frames: [0,1], delay: 30},
	};

	var BlockMonster = function (level, x, y) {
		var _this = this;

		//constants
		var initialHealth = 5;
		var moveDelay = 2;

		//state
		var moveTimer = 0;
		var action = "waiting";


		var onHit = function (collisions) {
		}

		function canSee (thing) {

		}

		var ai = function (gs) {
			if (action === "moving") {
				if (moveTimer >= moveDelay) {
					moveTimer = 0;
					var couldWalk = _this.tryMove(_this.dir.x,0);
					if (couldWalk === false) {
						action = "waiting";
					}
				} else {
					moveTimer++;
				}
			}
			if (action === "waiting") {
				gs.players.forEach(function (player) {
					if (canSee(player)) {
						_this.dir = pointTowards(player);
						action = "moving";
						moveTimer = 0;
					}
				});
			}
		}

		this.toData = function () {
			var data = this.monsterToData();
			data.moveTimer = moveTimer;
			data.action = action;
			return data;
		}

		this.fromData = function (data) {
			this.monsterFromData(data);
			moveTimer = data.moveTimer;
			action = data.action;
		}

		Util.extend(this, new Monster(level, x, y, 10, 10, sprites, anims, ai, initialHealth, onHit));
		this.startAnimation("idle");
	}
	return BlockMonster;
});