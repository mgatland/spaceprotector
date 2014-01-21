"use strict";
var Player = function (level, startPos) {
	extend(this, new WalkingThing(level, startPos, new Pos(5,5)));
	this.state = "falling";
	this.canJump = true;
	this.fallingTime = 0;
	this.loading = 0;
	this.refireRate = 15;
	this.dir = Dir.RIGHT;
	this.shotThisFrame = false;
	this.groundedY = this.pos.y;
	var spawnPoint = startPos.clone();

	var maxDeadTime = 30;
	var deadTimer = 0;

	var playerSprite0 =
	"  1  \n" +
	" 111 \n" +
	"1 1 1\n" +
	" 1 1 \n" +
	" 1 1 \n";

	this.draw = function (painter) {
		painter.drawSprite(this.pos.x, this.pos.y, playerSprite0, "#FFFF00");
	}

	this.isOnGround = function () {
		var leftFoot = level.isPointColliding(this.pos.clone().moveXY(0,this.size.y));
		var rightFoot = level.isPointColliding(this.pos.clone().moveXY(this.size.x-1,this.size.y));
		return (leftFoot || rightFoot);
	}

	this._shoot = function () {
		Events.shoot(new Shot(level, this.pos.clone(), this.dir, "player"));
	}

	this.update = function (left, right, shoot, shootHit, jump, jumpHit) {

		if (!this.alive) {
			if (deadTimer === 0) {
				this.alive = true;
				this.pos = spawnPoint.clone();
			} else {
				deadTimer--;
			}
			return;
		}

		if (this.collisions.length > 0) {
			this.collisions.length = 0;
			this.alive = false;
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
		} else if (right && !left) {
			this.dir = Dir.RIGHT;
			this.tryMove(1,0);
		}

		if (this.isOnGround()) {
			this.fallingTime = 0;
			this.canJump = true;
		}

		if (jumpHit && this.canJump) { // this means you can walk off a cliff and still jump for 3 frames
			this.state = "jumping";
			this.canJump = false;
			this.jumpTime = 0;
			this.jumpPhase = 1;
		}

		if (this.state === "jumping") {
			var speed = 0;
			if (this.jumpPhase === 1) {
				speed = -2;
			} else if (this.jumpPhase === 2) {
				speed = -1;
			}
			var unblocked = this.tryMove(0, speed);

			this.jumpTime++;
			if (this.jumpPhase === 1 && this.jumpTime > 3) {
				this.jumpPhase = 2;
				this.jumpTime = 0;
			}
			if (this.jumpPhase === 2 && this.jumpTime > 5 && (!jump || this.jumpTime > 15)) {
				this.jumpPhase = 3;
				this.jumpTime = 0;
			}
			if (!unblocked && this.jumpPhase != 3) {
				this.jumpPhase = 3;
				this.jumpTime = 0;
			}
			if (this.jumpPhase === 3 && this.jumpTime > 6) {
				this.state = "falling";
				this.fallingTime = 6; //Hack so the player can't recover from this fallingness.
			}

		} else if (!this.isOnGround()) {
			this.fallingTime++;
			if (this.fallingTime >= 3) {
				var speed = this.fallingTime < 10 ? 1 : 2;
				this.tryMove(0,speed);
				this.canJump = false;
			}
		}

		if (this.isOnGround() || this.pos.y > this.groundedY) {
			this.groundedY = this.pos.y;
		}
	}
}