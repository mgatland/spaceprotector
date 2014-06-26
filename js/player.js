"use strict";
define(["sprite_player", "sprites"], function () {
	var Player = function (level, startPos) {
		extend(this, new WalkingThing(level, startPos, new Pos(5,6)));

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
						this.state = states.falling;
						this.fallingTime = 0;
					}
				};
			},

			falling: new function () {
				this.preupdate = function () {};
				this.update = function () {
					animState = "falling";
					if (this.isOnGround()) {
						this.state = states.grounded;
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
						this.state = states.jumping;
						this.jumpTime = 0;
						this.jumpPhase = 1;
						jumpIsQueued = false;
					}
				};
				this.update = function () {
					if (!this.isOnGround()) {
						this.fallingTime++;
						if (this.fallingTime >= 3) {
							this.state = states.falling;
						}
					} else {
						this.fallingTime = 0;
					}
				};
			}
		};

		this.state = states.falling;
		this.fallingTime = 0;
		this.loading = 0;
		this.refireRate = 15;
		this.dir = Dir.RIGHT;
		this.shotThisFrame = false;
		this.groundedY = this.pos.y;
		var spawnPoint = startPos.clone();

		var maxDeadTime = 30;
		var deadTimer = 0;

		var animFrame = 0;
		var animDelay = 0;

		var animState = "standing";

		var jumpIsQueued = false;

		var playerSprites = [];
		loadFramesFromData(playerSprites, playerSpriteData);
		"  1  \n" +
		" 111 \n" +
		"1 1 1\n" +
		" 1 1 \n" +
		" 1 1 \n";

		this.draw = function (painter) {
			var color = this.live === true ? Colors.good : Colors.highlight;
			var frame;
			if (animState === "standing") {
				frame = playerSprites[0];
			} else if (animState === "running") {
				frame = playerSprites[animFrame+1];
			} else if (animState === "falling" ) {
				frame = playerSprites[5];
			} else if (animState === "jumping") {
				frame = playerSprites[1];
			} else {
				console.log("Error animation state " + animState);
			}
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, frame, color);
		}

		this.isOnGround = function () {
			var leftFoot = level.isPointColliding(this.pos.clone().moveXY(0,this.size.y));
			var rightFoot = level.isPointColliding(this.pos.clone().moveXY(this.size.x-1,this.size.y));
			return (leftFoot || rightFoot);
		}

		this._shoot = function () {
			Events.shoot(new Shot(level, this.pos.clone(), this.dir, "player"));
		}

		this.update = function (left, right, shoot, shootHit, jumpIsHeld, jumpIsHit) {

			if (!this.live) {
				if (deadTimer === 0) {
					this.live = true;
					this.pos = spawnPoint.clone();
					this.state = states.falling;
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

			if (this.collisions.length > 0) {
				this.collisions.length = 0;
				this.live = false;
				deadTimer = maxDeadTime;
			}

			if (this.loading > 0) this.loading--;

			if (shootHit || shoot && this.loading === 0) {
				this.loading = this.refireRate;
				this._shoot();
				this.shotThisFrame = true;
			} else {
				this.shotThisFrame = false;
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

			this.state.preupdate.call(this);

			this.state.update.call(this, jumpIsHeld);

			if (this.isOnGround() || this.pos.y > this.groundedY) {
				this.groundedY = this.pos.y;
			}
		}
	}
	return Player;
});