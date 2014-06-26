"use strict";

var Entity = function (pos, size) {
	this.collisions = [];
	this.pos = pos;
	this.size = size;
	this.live = true;
}

var WalkingThing = function (level, pos, size) {
	extend(this, new Entity(pos, size));

	this.isAtCliff = function(dir, minHeight) {
		if (dir === Dir.RIGHT) {
			var frontFoot = new Pos(this.pos.x + this.size.x, this.pos.y + this.size.y);
		} else {
			var frontFoot = new Pos(this.pos.x, this.pos.y + this.size.y);
		}
		return (level.cellDepthAt(frontFoot) >= minHeight);
	}

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

var monsterSprite1 =
		" 111 \n" +
		"1 1 1\n" +
		"11111\n" +
		" 111 \n" +
		" 1 1 \n";

var monsterSprite2 =
	" 11111111\n" +
	"11111 1 1\n" +
	"111111111\n" +
	" 1111    \n" +
	" 1111   1\n" +
	" 1111111 \n" +
	"11111   1\n" +
	"11111    \n" +
	" 1 1     \n";

var crateSprite =
	"1111111111\n" +
	"11      11\n" +
	"1 1    1 1\n" +
	"1  1  1  1\n" +
	"1   11   1\n" +
	"1   11   1\n" +
	"1  1  1  1\n" +
	"1 1    1 1\n" +
	"11      11\n" +
	"1111111111\n";

var flagSprite =
	"    111111\n" +
	"    11111 \n" +
	"    11111 \n" +
	"    111111\n" +
	"    1     \n" +
	"    1     \n" +
	"    1     \n" +
	"    1     \n" +
	"    1     \n" +
	" 11111111 \n";

var Monsters = {
	create1: function (level, x, y) {
		return new Monster(level, x, y, 5, 5, monsterSprite1, true, true, 1, true);
	},
	create2: function (level, x, y) {
		return new Monster(level, x, y, 9, 9, monsterSprite2, false, false, 4, true);
	},
	createCrate: function (level, x, y) {
		return new Monster(level, x, y, 10, 10, crateSprite, false, false, 1, false);
	},
	createFlag: function (level, x, y) {
		return new Flag(level, x, y);
	}
}

var Flag = function (level, x, y) {
	extend(this, new Entity(new Pos(x, y), new Pos(10, 10)));

	this.isCheckpoint = true;
	this.selected = false;

	this.ignoreShots = true;

	var sprite = flagSprite;
	this.update = function () {
	}
	this.draw = function (painter) {
		painter.drawSprite(this.pos.x, this.pos.y, sprite, this.selected ? Colors.highlight : Colors.good);
	};
}

var Monster = function (level, x, y, width, height, sprite, avoidCliffs, canShoot, health, canWalk) {
	var dir = Dir.LEFT;
	var refireDelay = 60;
	var refireTimer = refireDelay;
	var deadTime = 0;

	var action = null;
	if (canShoot === true) {
		action = "shooting";
	} else if (canWalk === true) {
		action = "walking";
	}
	var walkingTime = 0;
	var maxWalkingTime = 90;
	var shotsInARow = 0;
	var maxShotsInARow = 5;

	var moveDelay = 5;
	var moveTimer = 0;	

	extend(this, new WalkingThing(level, new Pos(x, y), new Pos(width, height)));

	this.killPlayerOnTouch = true;

	this.update = function () {
		if (this.live === false) {
			if (deadTime < 30) deadTime++;
			return;
		}

		if (canWalk) this.tryMove(0,1); //gravity

		if (action === "walking") {
			if (moveTimer === 0) {
				moveTimer = moveDelay;
				var couldWalk = this.tryMove(dir.x,0);
				if (couldWalk === false) {
					dir = dir.reverse;
				} else if (avoidCliffs === true && this.isAtCliff(dir, 2)) {
					dir = dir.reverse;
				}
			} else {
				moveTimer--;
			}
			walkingTime++;
			if (canShoot === true && walkingTime > maxWalkingTime) {
				action = "shooting";
				refireTimer = refireDelay;
				shotsInARow = 0;
			}
		}

		if (this.collisions.length > 0) {
			this.collisions.length = 0;
			health--;
			if (health == 0) { 
				this.live = false;
				return;
			}
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
		if (this.live === false) {
			if (deadTime < 30) {
				painter.drawSprite(this.pos.x, this.pos.y, sprite, Colors.highlight);		
			}
			return;
		}
		painter.drawSprite(this.pos.x, this.pos.y, sprite, Colors.bad);
	};
};