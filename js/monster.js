"use strict";

var WalkingThing = function (level, pos, size) {
	this.collisions = [];
	this.pos = pos;
	this.size = size;
	this.live = true;

	this.tryMove = function (x, y) {
		var ok = true;
		while (x != 0) {
			var sign = x > 0 ? 1 : -1;
			this.pos.x += sign;
			x -= sign;
			if (level.isColliding(this)) {
				this.pos.x -= sign;
				x = 0; //no more movement.
				ok = false;
			}
		}
		while (y != 0) {
			var sign = y > 0 ? 1 : -1;
			this.pos.y += sign;
			y -= sign;
			if (level.isColliding(this)) {
				this.pos.y -= sign;
				y = 0; //no more movement.
				ok = false;
			}
		}
		return ok;
	}
}

var Monster = function (level, x, y) {
	var dir = Dir.LEFT;

	var refireDelay = 60;
	var refireTimer = refireDelay;

	var action = "shooting";
	var walkingTime = 0;
	var maxWalkingTime = 90;
	var shotsInARow = 0;
	var maxShotsInARow = 5;

	var moveDelay = 5;
	var moveTimer = 0;

	var sprite =
			" 111 \n" +
			"1 1 1\n" +
			"11111\n" +
			" 111 \n" +
			" 1 1 \n";

	extend(this, new WalkingThing(level, new Pos(x, y), new Pos(5, 5)));
	this.update = function () {
		if (this.live === false) return;

		this.tryMove(0,1);

		if (action === "walking") {
			if (moveTimer === 0) {
				moveTimer = moveDelay;
				var couldWalk = this.tryMove(dir.x,0);
				if (couldWalk === false) dir = dir.reverse;
			} else {
				moveTimer--;
			}
			walkingTime++;
			if (walkingTime > maxWalkingTime) {
				action = "shooting";
				refireTimer = refireDelay;
				shotsInARow = 0;
			}
		}

		if (this.collisions.length > 0) {
			this.live = false;
			return;
		}

		if (action === "shooting") {
			if (refireTimer === 0) {
				Events.shoot(new Shot(level, this.pos.clone(), dir, "monster"));
				refireTimer = refireDelay;
				shotsInARow++;
				if (shotsInARow === maxShotsInARow) {
					action = "walking";
					walkingTime = 0;
				}
			} else {
				refireTimer--;
			}
		}

	};
	this.draw = function (painter) {
		if (this.live === false) return;
		painter.drawSprite(this.pos.x, this.pos.y, sprite, "#FFFF00");
	};
};