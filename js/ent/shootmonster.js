"use strict";
define(["ent/shot", "util", "sprites", "spritedata", "ent/monster", "events"],
	function(Shot, Util, Sprites, SpriteData, Monster, Events) {
	var shooterSprites = Sprites.loadFramesFromData(SpriteData.shooter);
	var shooterAnims = {
		walk: {frames: [0, 1, 2, 3], delay: 5}, 
		shoot: {frames: [4, 5, 6, 7, 8], delay: 60/5} //refireDelay / frames.length
	};

	var ShootMonster = function (gs, x, y) {
		var _this = this;
		//constants
		var maxWalkingTime = 90;
		var maxShotsInARow = 5;
		var moveDelay = 5;
		var refireDelay = 60;

		//state TODO: Replicate
		var refireTimer = refireDelay;
		var action = "shooting";
		var moveTimer = 0;
		var shotsInARow = 0;
		var walkingTime = 0;

		var ai = function () {
			_this.tryMove(0,1); //gravity

			if (action === "walking") {
				if (moveTimer === 0) {
					moveTimer = moveDelay;
					var couldWalk = _this.tryMove(_this.dir.x,0);
					if (couldWalk === false) {
						_this.dir = _this.dir.reverse;
					} else if (_this.isAtCliff(_this.dir, 2)) {
						_this.dir = _this.dir.reverse;
					}
				} else {
					moveTimer--;
				}
				walkingTime++;
				if (walkingTime > maxWalkingTime) {
					action = "shooting";
					refireTimer = refireDelay;
					shotsInARow = 0;
					_this.startAnimation("shoot");
				}
			}

			if (action === "shooting") {
				if (refireTimer === 0) {
					Events.shoot(new Shot(gs, _this.pos.clone().moveXY(0, Math.floor(_this.size.x/2)), _this.dir, "monster"));
					Events.playSound("mshoot", _this.pos.clone());
					refireTimer = refireDelay;
					shotsInARow++;
					_this.startAnimation("shoot"); //force animation to stay in sync with actual firing.
					if (shotsInARow === maxShotsInARow) {
						action = "walking";
						walkingTime = 0;
						_this.startAnimation("walk");
					}
				} else {
					refireTimer--;
				}
			}
		}

		this.toData = function () {
			var data = this.monsterToData();
			data.refireTimer = refireTimer;
			data.action = action;
			data.walkingTime = walkingTime;
			data.shotsInARow = shotsInARow;
			data.moveTimer = moveTimer;
			return data;
		}

		this.fromData = function (data) {
			this.monsterFromData(data);
			refireTimer = data.refireTimer;
			action = data.action;
			walkingTime = data.walkingTime;
			shotsInARow = data.shotsInARow;
			moveTimer = data.moveTimer;
		}

		Util.extend(this, new Monster(gs, x, y, 7, 9, shooterSprites, shooterAnims, ai, 1));
		this.startAnimation("shoot");
	}
	return ShootMonster;
});