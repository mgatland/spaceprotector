"use strict"
define(["sprites", "spritedata", "util", "ent/monster"], 
	function (Sprites, SpriteData, Util, Monster) {
	var walkerSprites = Sprites.loadFramesFromData(SpriteData.walker);
	var walkerAnims = {
		walk: {frames: [0,1], delay: 5},
		stunned: {frames: [2], delay: 999},
		run: {frames: [2, 3, 4, 5], delay: 3}
	};

	var WalkMonster = function (gs, x, y) {
		var _this = this;

		//constants
		var initialHealth = 5;
		var moveDelay = 5;
		var fastMoveDelay = 0;
		var maxAggro = 30;
		var stunDuration = 20;

		//state
		var moveTimer = 0;
		var aggro = 0; //includes stun time as well

		var onHit = function (collisions) {
			if (aggro === 0) {
				aggro = maxAggro + stunDuration;
				_this.startAnimation("stunned");
			} else {
				aggro = Math.max(aggro, maxAggro);
			}
		}

		var ai = function () {
			_this.tryMove(0,1); //gravity

			if (aggro > 0) {
				aggro--;
				if (aggro === maxAggro) {
					_this.startAnimation("run");
					moveTimer = 0; //sync with animation
				}
				if (aggro === 0) {
					_this.startAnimation("walk");
					moveTimer = 0; //sync with animation
				}
			}

			if (aggro > maxAggro) {
				//I'm so angry I can't move.
				return;
			}
			var delay = aggro > 0 ? fastMoveDelay : moveDelay
			if (moveTimer >= delay) {
				moveTimer = 0;
				var couldWalk = _this.tryMove(_this.dir.x,0);
				if (couldWalk === false) {
					_this.dir = _this.dir.reverse;
				} else if (_this.isAtCliff(_this.dir, 2)) {
					_this.dir = _this.dir.reverse;
				}
			} else {
				moveTimer++;
			}
		}

		this.toData = function () {
			var data = this.monsterToData();
			data.moveTimer = moveTimer;
			data.aggro = aggro;
			return data;
		}

		this.fromData = function (data) {
			this.monsterFromData(data);
			moveTimer = data.moveTimer;
			aggro = data.aggro;
		}

		Util.extend(this, new Monster(gs, x, y, 9, 9, walkerSprites, walkerAnims, ai, initialHealth, onHit));
		this.startAnimation("walk");
	}
	return WalkMonster;
});