"use strict";
define(["shot", "sprite_player", "sprites"], function (Shot) {
	var Player = function (level, startPos) {
		var _this = this;
		
		extend(this, new WalkingThing(level, startPos, new Pos(5,6)));

		//Replicated variables
		this.state = "falling";
		this.fallingTime = 0;
		this.loading = 0;
		this.refireRate = 15;
		this.dir = Dir.RIGHT;
		this.shotThisFrame = false;
		this.groundedY = this.pos.y;

		var spawnPoint = startPos.clone();
		var currentCheckpoint = null; //The flag entity we last touched

		var deadTimer = 0;
		var animFrame = 0;
		var animDelay = 0;

		var animState = "standing";
		var shootingAnim = false;
		var timeSinceLastShot = 0;

		var jumpIsQueued = false;

		this.toData = function () {
			var data = {};
			data.state = this.state;
			data.fallingTime = this.fallingTime;
			data.loading = this.loading;
			data.dir = Dir.toId(this.dir);
			data.shotThisFrame = this.shotThisFrame;
			data.groundedY = this.groundedY;

			data.spawnPoint = spawnPoint.toData();
			//currentCheckpoint
			data.deadTimer = deadTimer;
			data.animFrame = animFrame;
			data.animDelay = animDelay;
			data.animState = animState;
			data.shootingAnim = shootingAnim;
			data.timeSinceLastShot = timeSinceLastShot;
			data.jumpIsQueued = jumpIsQueued;

			Entity.toData(this, data);
			return data;
		}

		this.fromData = function (data) {
			this.state = data.state;
			this.fallingTime = data.fallingTime;
			this.loading = data.loading;
			this.dir = Dir.fromId(data.dir);
			this.shotThisFrame = data.shotThisFrame;
			this.groundedY = data.groundedY;

			spawnPoint = Pos.fromData(data.spawnPoint);
			//currentCheckpoint
			deadTimer = data.deadTimer;
			animFrame = data.animFrame;
			animDelay = data.animDelay;
			animState = data.animState;
			shootingAnim = data.shootingAnim;
			timeSinceLastShot = data.timeSinceLastShot;
			jumpIsQueued = data.jumpIsQueued;

			Entity.fromData(this, data);
		}

		//Constants or not replicated

		var maxDeadTime = 30;
		var playerSprites = [];

		//functions

		var states = {

			jumping: new function () {
				var phases = [];
				phases[1] = {ySpeed: -2, normalDuration: 3};
				phases[2] = {ySpeed: -1, normalDuration: 5, jumpHeldDuration: 15};
				phases[3] = {ySpeed: 0, normalDuration: 6};
				this.preupdate = function () {};
				this.update = function (jumpIsHeld) {
					animState = "jumping";
					var phase = phases[this.jumpPhase];

					var speed = phase.ySpeed;
					var spaceAboveMe = this.tryMove(0, speed);

					this.jumpTime++;
					var duration = (jumpIsHeld && phase.jumpHeldDuration) ? phase.jumpHeldDuration : phase.normalDuration;
					if (this.jumpTime > duration) {
						this.jumpPhase++;
						this.jumpTime = 0;
					}
					if (!spaceAboveMe && this.jumpPhase < 3) {
						this.jumpPhase = 3;
						this.jumpTime = 0;
					}
					if (this.jumpPhase === 4) {
						this.state = "falling";
						this.fallingTime = 0;
					}
				};
			},

			falling: new function () {
				this.preupdate = function () {};
				this.update = function () {
					animState = "falling";
					if (this.isOnGround()) {
						Events.playSound("land", this.pos.clone());
						this.state = "grounded";
					} else {
						this.fallingTime++;
						var speed = this.fallingTime < 10 ? 1 : 2;
						this.tryMove(0,speed);
					}
				};
			},

			grounded: new function () {
				this.preupdate = function () {
					if (jumpIsQueued) {
						this.state = "jumping";
						this.jumpTime = 0;
						this.jumpPhase = 1;
						jumpIsQueued = false;
						Events.playSound("jump", this.pos.clone());
					}
				};
				this.update = function () {
					if (!this.isOnGround()) {
						this.fallingTime++;
						if (this.fallingTime >= 3) {
							this.state = "falling";
						}
					} else {
						this.fallingTime = 0;
					}
				};
			}
		};

		this.draw = function (painter) {
			var color = this.live === true ? Colors.good : Colors.highlight;
			var frame;
			if (animState === "standing") {
				frame = 0;
			} else if (animState === "running") {
				frame = animFrame+1;
			} else if (animState === "falling" ) {
				frame = 5;
			} else if (animState === "jumping") {
				frame = 1;
			} else {
				console.log("Error animation state " + animState);
			}
			if (shootingAnim && frame === 0) frame = 6;
			var img = playerSprites[frame];
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, img, color);
		}

		this.isOnGround = function () {
			var leftFoot = level.isPointColliding(this.pos.clone().moveXY(0,this.size.y));
			var rightFoot = level.isPointColliding(this.pos.clone().moveXY(this.size.x-1,this.size.y));
			return (leftFoot || rightFoot);
		}

		this._shoot = function () {
			Events.shoot(new Shot(level, this.pos.clone(), this.dir, "player"));
			Events.playSound("pshoot", this.pos.clone());
		}

		this.update = function (left, right, shoot, shootHit, jumpIsHeld, jumpIsHit) {

			if (!this.live) {
				if (deadTimer === 0) {
					this.live = true;
					this.pos = spawnPoint.clone();
					this.state = "falling";
				} else {
					deadTimer--;
				}
				return;
			}

			if (animState !== "running") {
				animDelay = 0;
				animFrame = 3; //first frame when we start running after landing\standing still
			} else {
				animDelay++;
				if (animDelay >= 5) {
					animDelay = 0;
					animFrame++;
					if (animFrame === 4) animFrame = 0;
				}
			}

			this.collisions.forEach(function (other) {
				if (other.killPlayerOnTouch) {
					_this.live = false;
					deadTimer = maxDeadTime;
					Events.playSound("pdead", null);
				}
				if (other.isCheckpoint && other !== currentCheckpoint) {
					if (currentCheckpoint) currentCheckpoint.selected = false;
					spawnPoint = other.pos.clone();
					currentCheckpoint = other;
					currentCheckpoint.selected = true;
					Events.playSound("checkpoint", _this.pos.clone());
				}
				if (other.isEnd) {
					Events.winLevel();
				}
			});
			this.collisions.length = 0;

			if (this.loading > 0) this.loading--;

			if (shootHit || shoot && this.loading === 0) {
				this.loading = this.refireRate;
				this._shoot();
				this.shotThisFrame = true;
			} else {
				this.shotThisFrame = false;
			}

			if (shoot) {
				shootingAnim = true;
				timeSinceLastShot = 0;
			} else {
				timeSinceLastShot++;
				if (timeSinceLastShot > 30) shootingAnim = false;
			}

			if (left && !right) {
				this.dir = Dir.LEFT;
				this.tryMove(-1,0);
				animState = "running";
			} else if (right && !left) {
				this.dir = Dir.RIGHT;
				this.tryMove(1,0);
				animState = "running";
			} else {
				animState = "standing";
			}

			//If you hit jump and hold it down, that hit gets queued.
			if (jumpIsHit) {
				jumpIsQueued = true;
			} else {
				jumpIsQueued = jumpIsQueued && jumpIsHeld;
			}

			getState().preupdate.call(this);

			getState().update.call(this, jumpIsHeld);

			if (this.isOnGround() || this.pos.y > this.groundedY) {
				this.groundedY = this.pos.y;
			}
		}

		var getState = function () {
			return states[_this.state];
		}

		loadFramesFromData(playerSprites, playerSpriteData);
	}
	return Player;
});