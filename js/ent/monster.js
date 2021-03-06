"use strict";
define(["ent/shot", "events", "colors", "entity", "ent/walkingthing", 
	"sprites", "spritedata", "dir", "pos", "util"], 
	function (Shot, Events, Colors, Entity, WalkingThing, Sprites, 
		SpriteData, Dir, Pos, Util) {

	var flagSprites = Sprites.loadFramesFromData(SpriteData.flag);
	var endSprites = Sprites.loadFramesFromData(SpriteData.end);

	var End = function (gs, x, y) {
		Util.extend(this, new Entity(new Pos(x, y), new Pos(10, 10)));
		this.isEnd = true;
		this.ignoreShots = true;
		this.update = function () {}
		this.draw = function (painter) {
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, Dir.LEFT, endSprites[0], Colors.good);
		};
		this.toData = function () { return null};
		this.fromData = function () {/*not replicated*/};
	}

	var Flag = function (gs, x, y) {
		Util.extend(this, new Entity(new Pos(x, y), new Pos(10, 10)));

		this.isCheckpoint = true;
		this.selected = false;

		this.ignoreShots = true;

		this.update = function () {
		}
		this.draw = function (painter) {
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, Dir.LEFT, flagSprites[0], this.selected ? Colors.highlight : Colors.good);
		};
		this.toData = function () { return null};
		this.fromData = function () {/*not replicated*/};
	}

	var springSprites = Sprites.loadFramesFromData(SpriteData.spring);
	var Spring = function (gs, x, y) {
		Util.extend(this, new Entity(new Pos(x, y), new Pos(8, 3)));

		this.isSpring = true;
		this.ignoreShots = true;
		this.pos.moveXY(10-this.size.x, 10-this.size.y);
		var sensor = new Entity(this.pos.clone().moveXY(0, this.size.y - 1), new Pos(this.size.x, 1));

		this.update = function () {
			//If my sensor is touching the player
			gs.players.forEach(function (p) {
				if (Entity.isColliding(p, sensor, true)) {
					p.spring();
				}
			});
		}
		this.draw = function (painter) {
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, Dir.RIGHT, springSprites[0], Colors.good);
		};
		this.toData = function () { return null};
		this.fromData = function () {/*not replicated*/};
	}

	var Monster = function (gs, x, y, width, height, sprites, anims, ai, health, onHit) {

		//constants
		this.killPlayerOnTouch = true;
		this.killIsCounted = true;
		var maxDeadTime = 30;

		//state
		Util.extend(this, new WalkingThing(gs, new Pos(x, y), new Pos(width, height)));

		this.isNetDirty = true;
		this.health = health;

		this.dir = Dir.RIGHT;
		var deadTime = 0;
		var anim = "walk"; //default
		var animFrame = 0;
		var animDelay = 0;
		var hitPos = null;
		var hitFlash = 0;

		this.monsterToData = function () {
			var data = {};
			data.health = this.health;
			data.dir = Dir.toId(this.dir);
			data.deadTime = deadTime;
			data.anim = anim;
			data.animFrame = animFrame;
			data.animDelay = animDelay;
			data.hitPos = hitPos ? hitPos.toData() : null;
			data.hitFlash = hitFlash;
			WalkingThing.toData(this, data);
			return data;
		}

		this.monsterFromData = function (data) {
			this.health = data.health;
			this.dir = Dir.fromId(data.dir);
			deadTime = data.deadTime;
			anim = data.anim;
			animFrame = data.animFrame;
			animDelay = data.animDelay;
			hitPos = Pos.fromData(data.hitPos);
			hitFlash = data.hitFlash;
			WalkingThing.fromData(this, data);
		}

		//override me with your custom data
		this.toData = function () {
			var data = this.monsterToData();
			//your custom data
			return data;
		}

		//override me with your custom data
		this.fromData = function (data) {
			this.monsterFromData(data);
			//your custom data
		}

		var getAnimation = function () {
			if (anims === null) return {frames: [0], delay: 0};
			return anims[anim];
		}

		this.startAnimation = function(newAnim) {
			anim = newAnim;
			animFrame = 0;
			animDelay = 0;
		}

		this.update = function () {
			if (this.live === false) {
				if (deadTime < maxDeadTime) deadTime++;
				return;
			}


			if (hitFlash > 0) hitFlash--;
			animDelay++;
			if (animDelay > getAnimation().delay) {
				animDelay = 0;
				animFrame++;
				if (animFrame >= getAnimation().frames.length) {
					animFrame = 0;
				}
			}

			if (ai) ai();

			if (this.collisions.length > 0) {
				this.health--;
				hitPos = this.collisions[0].pos.clone();
				hitPos.clampWithin(this.pos, this.size);
				if (onHit) onHit();
				this.collisions.length = 0;
				if (this.health == 0) { 
					this.live = false;
					Events.playSound("mdead", this.pos.clone());
					return;
				} else {
					hitFlash = 2;
					Events.playSound("mhit", this.pos.clone());
				}
			}
		};

		this.getFrame = function () {
			return sprites[getAnimation().frames[animFrame]];
		}

		this.draw = function (painter) {
			if (this.live === false) {
				if (deadTime < maxDeadTime) {
					painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, this.getFrame(), Colors.highlight, false, deadTime/maxDeadTime, hitPos);
				}
				return;
			}
			var color = (hitFlash > 0 ? Colors.highlight : Colors.bad);
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, this.getFrame(), color);
		};
	};

	Monster.createFlag = function (gs, x, y) {
		return new Flag(gs, x, y);
	};
	Monster.createSpring = function (gs, x, y) {
		return new Spring(gs, x, y);
	};
	Monster.createEnd = function (gs, x, y) {
		return new End(gs, x, y);
	};

	return Monster;
});