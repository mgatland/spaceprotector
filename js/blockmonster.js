"use strict";
define(["sprites", "spritedata", "util", "monster", "pos", "events"], 
	function (Sprites, SpriteData, Util, Monster, Pos, Events) {
	var sprites = Sprites.loadFramesFromData(SpriteData.blockMonster);
	var anims = {
		idle: {frames: [0], delay: 0},
		moving: {frames: [1], delay: 0},
		recovering: {frames: [2], delay: 0},
		preparing: {frames: [2], delay: 0},
	};

	var BlockMonster = function (level, x, y) {
		var _this = this;

		//constants
		var initialHealth = 5;
		var moveDelay = 0;
		var recoveryDelay = 30;
		var preparingDelay = 20;
		var speed = 4;
		var seeDistance = 10*10;

		//state
		var moveTimer = 0;
		var action = "waiting";

		var onHit = function (collisions) {
		}

		function canSee (thing) {
			//vertical
			if (thing.pos.x + thing.size.x > _this.pos.x
				&& thing.pos.x < _this.pos.x + _this.size.x) {
				if (Math.abs(thing.pos.y - _this.pos.y) < seeDistance) return true;
				return false;
			}
			//horizontal
			if (thing.pos.y + thing.size.y > _this.pos.y
				&& thing.pos.y < _this.pos.y + _this.size.y) {
				if (Math.abs(thing.pos.x - _this.pos.x) < seeDistance) return true;
				return false;
			}
		}

		var ai = function (gs) {
			if (action === "moving") {
				if (moveTimer >= moveDelay) {
					moveTimer = 0;
					var couldWalk = _this.tryMove(_this.dir.x*speed,_this.dir.y*speed);
					if (couldWalk === false) {
						action = "recovering";
						Events.playSound("blockstop", _this.pos.clone());
						_this.startAnimation("recovering");
						moveTimer = 0;
					}
				} else {
					moveTimer++;
				}
			}
			if (action === "recovering") {
				if (moveTimer >= recoveryDelay) {
					moveTimer = 0;
					action = "waiting";
					_this.startAnimation("idle");
				} else {
					moveTimer++;
				}
			}
			if (action === "preparing") {
				if (moveTimer >= preparingDelay) {
					moveTimer = 0;
					action = "moving";
					_this.startAnimation("moving");
				} else {
					moveTimer++;
				}
			}
			if (action === "waiting") {
				gs.players.forEach(function (player) {
					if (!player.hidden && canSee(player)) {
						_this.dir = Pos.bestDirFromTo(
							_this.getCenter(),
							player.getCenter());

						//check that we can actually move that way
						if (_this.tryMove(_this.dir.x, _this.dir.y)) {
							//undo that test move
							_this.pos.moveXY(-_this.dir.x, -_this.dir.y);
							//prepare to move
							action = "preparing";
							_this.startAnimation("preparing");
							moveTimer = 0;
							Events.playSound("blockstart", _this.pos.clone());
						}

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