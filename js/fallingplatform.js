"use strict";
define(["sprites", "spritedata", "util", "entity", "pos", "events", "colors"], 
	function (Sprites, SpriteData, Util, Entity, Pos, Events, Colors) {
	var sprites = Sprites.loadFramesFromData(SpriteData.fallingPlatform);
	var anims = {
		solid: {frames: [0], delay: 0},
		breaking: {frames: [0], delay: 0},
		respawning: {frames: [0], delay: 0},
		gone: {frames: [1], delay: 0}
	};

	var Anim = function (sprites, anims) {
		var name = "walk"; //default
		var frame = 0;
		var delay = 0;

		var getAnimation = function () {
			if (anims === null) return {frames: [0], delay: 0};
			return anims[name];
		}

		this.startAnimation = function(newAnim) {
			name = newAnim;
			frame = 0;
			delay = 0;
		}

		this.update = function () {
			delay++;
			if (delay > getAnimation().delay) {
				delay = 0;
				frame++;
				if (frame >= getAnimation().frames.length) {
					frame = 0;
				}
			}			
		}

		this.getFrame = function () {
			return sprites[getAnimation().frames[frame]];
		}
	}

	var FallingPlatform = function (level, x, y) {
		var _this = this;
		var anim = new Anim(sprites, anims);

		//constants
		var breakDelay = 30;
		var recoveryDelay = 30;
		var goneDelay = 180;

		//state
		var action = "";
		var breakTimer = 0;
		var goneTimer = 0;
		var recoveryTimer = 0;
		var hitFlash = 0;
		var hitPos = null;
		this.isPlatform = true;

		this.getFrame = function () {
			return anim.getFrame();
		}

		var startSolid = function () {
			action = "solid";
			anim.startAnimation("solid");
			_this.isPlatform = true;
		}

		var startBreaking = function () {
			action = "breaking";
			breakTimer = 0;
			anim.startAnimation("breaking");
		}

		var startGone = function () {
			action = "gone";
			goneTimer = 0;
			anim.startAnimation("gone");
			_this.isPlatform = false;
		}

		var startRecovery = function () {
			action = "respawning";
			recoveryTimer = 0;
			anim.startAnimation("respawning");
		}

		var ai = function (gs) {
			if (action === "breaking") {
				breakTimer++;
				hitFlash = (Math.floor(breakTimer / 3)) % 2;
				if (breakTimer > breakDelay) {
					startGone();
				}
			}
			if (action === "gone") {
				goneTimer++;
				if (goneTimer > goneDelay) {
					startRecovery();
				}
			}
			if (action === "respawning") {
				recoveryTimer++;
				if (recoveryTimer > recoveryDelay) {
					startSolid();
				}
			}
		}

		var onHit = function () {
			if (action === "solid") {
				startBreaking();
			}
		}

		this.update = function(gs) {
			anim.update();

			if (hitFlash > 0) {
				hitFlash--;
			}

			if (ai) ai(gs);

			if (this.collisions.length > 0) {
				hitPos = this.collisions[0].pos.clone();
				hitPos.clampWithin(this.pos, this.size);
				if (onHit) onHit();
				this.collisions.length = 0;
				hitFlash = 2;
			}
		}

		this.draw = function (painter) {
			var color = (hitFlash > 0 ? Colors.highlight : Colors.bad);
			painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, anim.getFrame(), color);
		};

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

		Util.extend(this, new Entity(new Pos(x, y), new Pos(10, 10)));
		startSolid();
	}
	return FallingPlatform;
});