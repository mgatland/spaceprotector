"use strict"
define(["sprites", "spritedata", "util", "monster", "dir"], 
	function (Sprites, SpriteData, Util, Monster, Dir) {

	var sprites = Sprites.loadFramesFromData(SpriteData.wolf);
	var anims = {
		fall: {frames: [0], delay: 50}, 
		bounce: {frames: [0, 1, 2, 3, 2, 1, 0], delay: 2},
		jump: {frames: [0], delay: 50}, 
		wait: {frames: [4,4,4,4,4,5,6,6,6,6,6,5], delay: 13}
	};

	var Wolf = function (level, x, y) {
		var _this = this;

		//constants
		var initialHealth = 1;
		var moveDelay = 0;
		var seeDistance = 10*11;
		var seeDistanceYLimit = 10*6;
		var maxWakefulness = 20;
		var maxSlidingTime = 14;

		//state
		var state;
		var moveTimer = 0;
		var wakefulness = 0;
		var slidingTime = 0;
		this.jumpPhase = 0;

		var doWalking = function () {
			var delay = moveDelay;
			if (moveTimer >= delay) {
				moveTimer = 0;
				var couldWalk = _this.tryMove(_this.dir.x,0);
			} else {
				moveTimer++;
			}
		}

		var facePlayer = function (gs) {

			var target = _this.getTarget(gs);

			if (target) {
				if (target.pos.x > _this.pos.x) {
					_this.dir = Dir.RIGHT;
				} else {
					_this.dir = Dir.LEFT;
				}
			}
		}

		var states = {
			waiting: new function () {
				this.preupdate = function () {};
				this.update = function (gs) {
					var disturbed = false;
					gs.players.forEach(function (player) {
						if (!player.hidden 
							&& player.pos.y > _this.pos.y - seeDistanceYLimit
							&& player.pos.y < _this.pos.y + seeDistanceYLimit
							&& _this.pos.distanceTo(player.pos) < seeDistance
							&& level.canSee(_this.getCenter(), player.getCenter())) {
							disturbed = true;
						}
					});
					if (disturbed) {
						wakefulness++;
						if (wakefulness >= maxWakefulness) {
							facePlayer(gs);
							state = "falling";
							_this.startAnimation("fall");
							//Events.playSound("waspstart", _this.pos.clone());					
						}
					}
				}
			},
			jumping: new function () {
				var phases = [];
				phases[1] = {ySpeed: -2, normalDuration: 5};
				phases[2] = {ySpeed: -1, normalDuration: 11};
				phases[3] = {ySpeed: 0, normalDuration: 6};
				this.preupdate = function () {};
				this.update = function () {
					var phase = phases[this.jumpPhase];

					var speed = phase.ySpeed;
					var spaceAboveMe = this.tryMove(0, speed);
					this.jumpTime++;
					var duration = phase.normalDuration;
					if (this.jumpTime > duration) {
						this.jumpPhase++;
						this.jumpTime = 0;
					}
					if (!spaceAboveMe && this.jumpPhase < 3) {
						this.jumpPhase = 3;
						this.jumpTime = 0;
					}
					if (this.jumpPhase === 4) {
						state = "falling";
						this.fallingTime = 0;
						_this.startAnimation("fall");
					}

					doWalking();
				};
			},
			falling: new function () {
				this.preupdate = function () {};
				this.update = function (gs) {
					if (this.isOnGround()) {
						//Events.playSound("land", this.pos.clone());
						state = "sliding";
						slidingTime = 0;
						_this.startAnimation("bounce");
					} else {
						this.fallingTime++;
						var speed = this.fallingTime < 10 ? 1 : 2;
						this.tryMove(0,speed);
					}
					doWalking();
				};
			},
			sliding: new function () {
				this.preupdate = function () {};
				this.update = function (gs) {
					if (!this.isOnGround()) {
						state = "falling";
						this.fallingTime = 0;
						_this.startAnimation("fall");
					} else if (slidingTime >= maxSlidingTime) {
						facePlayer(gs);
						state = "jumping";
						this.jumpPhase = 1;
						this.jumpTime = 0;
						_this.startAnimation("jump");
					} else {
						doWalking();
						slidingTime++;
					}
				}
			}
		};

		var ai = function (gs) {
			getState().preupdate.call(_this);
			getState().update.call(_this, gs);
		}

		var getState = function () {
			return states[state];
		}

		this.toData = function () {
			var data = this.monsterToData();
			data.moveTimer = moveTimer;
			data.state = state;
			data.jumpPhase = this.jumpPhase;
			data.wakefulness = wakefulness;
			return data;
		}

		this.fromData = function (data) {
			this.monsterFromData(data);
			moveTimer = data.moveTimer;
			state = data.state;
			this.jumpPhase = data.jumpPhase
			wakefulness = data.wakefulness;
		}

		Util.extend(this, new Monster(level, x, y, 10, 10, sprites, anims, ai, initialHealth));
		this.startAnimation("wait");
		state = "waiting";
	}
	return Wolf;
});