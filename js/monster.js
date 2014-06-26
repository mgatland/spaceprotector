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

var shootMonsterSprite = "v1.0:001110000000010101000000010111000000010101000000000100000000000100000000000100000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000100000000001111000000001000000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000100000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000100000000011110000000000010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000100000000000110000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000100000000000110000000000110000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000110000000000110000000000100000000001110000000001010000000000000000000000000000000000000000000001110000000010101000000010111000000010101000000000111000000000111000000000100000000001110000000001010000000000000000000000000000000000000000000000000000000001110000000010101000000010111000000010101100000000111000000000100000000001110000000001010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
	var shootMonsterAnims = {
		walk: {frames: [0, 1, 2, 3], delay: 5}, 
		shoot: {frames: [4, 5, 6, 7, 8], delay: 60/5} //refireDelay / frames.length
	};

var monsterSprite2 = "v1.0:011111111000111110101000111111111000011110000000011110001000011111110000111110001000111110000000010100000000000000000000000000000000000000000000";
	var walkMonsterAnims = {
		walk: {frames: [0], delay: 0}
	};

var crateSprite = "v1.0:111111111100110000001100101000010100100100100100100011000100100011000100100100100100101000010100110000001100111111111100000000000000000000000000";

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
		return new Monster(level, x, y, 7, 9, shootMonsterSprite, shootMonsterAnims, true, true, 1, true);
	},
	create2: function (level, x, y) {
		return new Monster(level, x, y, 9, 9, monsterSprite2, walkMonsterAnims, false, false, 4, true);
	},
	createCrate: function (level, x, y) {
		return new Monster(level, x, y, 10, 10, crateSprite, null, false, false, 1, false);
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

var Monster = function (level, x, y, width, height, spriteData, anims, avoidCliffs, canShoot, health, canWalk) {

	var dir = Dir.LEFT;
	var refireDelay = 60;
	var refireTimer = refireDelay;
	var deadTime = 0;

	var sprites = [];
	//todo: don't generate sprites for each instance
	loadFramesFromData(sprites, spriteData);
	var anim = {frames: [0], delay: 0}; //default

	var action = null;
	if (canShoot === true) {
		action = "shooting";
		anim = anims.shoot;
	} else if (canWalk === true) {
		action = "walking";
		anim = anims.walk;
	}
	var walkingTime = 0;
	var maxWalkingTime = 90;
	var shotsInARow = 0;
	var maxShotsInARow = 5;

	var moveDelay = 5;
	var moveTimer = 0;	

	extend(this, new WalkingThing(level, new Pos(x, y), new Pos(width, height)));

	this.killPlayerOnTouch = true;

	var startAnimation = function(newAnim) {
		anim = newAnim;
		animFrame = 0;
		animDelay = 0;
	}

	this.update = function () {
		if (this.live === false) {
			if (deadTime < 30) deadTime++;
			return;
		}

		if (canWalk) this.tryMove(0,1); //gravity

		animDelay++;
		if (animDelay > anim.delay) {
			animDelay = 0;
			animFrame++;
			if (animFrame >= anim.frames.length) {
				animFrame = 0;
			}
		}

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
				startAnimation(anims.shoot);
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
				Events.shoot(new Shot(level, this.pos.clone().moveXY(0, this.size.x/2), dir, "monster"));
				refireTimer = refireDelay;
				shotsInARow++;
				startAnimation(anims.shoot); //force animation to stay in sync with actual firing.
				if (shotsInARow === maxShotsInARow) {
					action = "walking";
					walkingTime = 0;
					startAnimation(anims.walk);
				}
			} else {
				refireTimer--;
			}
		}
	};
	var animFrame = 0;
	var animDelay = 0;
	this.draw = function (painter) {
		if (this.live === false) {
			if (deadTime < 30) {
				painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, dir, sprites[anim.frames[animFrame]], Colors.highlight);
			}
			return;
		}
		painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, dir, sprites[anim.frames[animFrame]], Colors.bad);
	};
};