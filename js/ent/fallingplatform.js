"use strict";
define(["sprites", "spritedata", "util", "entity", "pos", "events", "colors"], 
	function (Sprites, SpriteData, Util, Entity, Pos, Events, Colors) {
	var sprites = Sprites.loadFramesFromData(SpriteData.fallingPlatform);
	var anims = {
		solid: {frames: [0], delay: 0},
		breaking: {frames: [0], delay: 0},
		respawning: {frames: [1,2,3,4,5], delay: 5},
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

	var FallingPlatform = function (gs, x, y) {
		var _this = this;
		var anim = new Anim(sprites, anims);
		var weightSensor;

		//constants
		var breakDelay = 30;
		var recoveryDelay = 25;
		var goneDelay = 180;
		var goneAnimTime = 30; //equivalent to maxDeadTime

		//state
		var action = "";
		var breakTimer = 0;
		var goneTimer = 0;
		var recoveryTimer = 0;
		var hitFlash = 0;
		var hitPos = null;
		this.isPlatform = true;
		var hitPos;

		this.getFrame = function () {
			return anim.getFrame();
		}

		var startSolid = function () {
			action = "solid";
			anim.startAnimation("solid");
			_this.isPlatform = true;
			_this.ignoreShots = false;
			gs.players.forEach(function (p) {
				if (Entity.isColliding(p, _this, true)) {
					p.hurt(p.pos);
				}
			});
		}

		var startBreaking = function () {
			action = "breaking";
			breakTimer = 0;
			anim.startAnimation("breaking");
			Events.playSound("alert1", _this.pos.clone());
		}

		var startGone = function () {
			action = "gone";
			goneTimer = 0;
			_this.isPlatform = false;
			_this.ignoreShots = true;
			Events.playSound("mdead", _this.pos.clone());
		}

		var startRecovery = function () {
			action = "respawning";
			recoveryTimer = 0;
			anim.startAnimation("respawning");
		}

		var ai = function () {

			if (action === "solid") {
				var triggered = false;
				gs.players.forEach(function (p) {
					if (Entity.isColliding(p, weightSensor, true)) {
						triggered = true;
					}
				});
				if (triggered) {
					hitPos = weightSensor.getCenter();
					startBreaking();
				}
			}

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
			if (action === "solid" || action === "breaking") {
				startGone();
			}
		}

		this.update = function() {
			anim.update();

			if (hitFlash > 0) {
				hitFlash--;
			}

			if (ai) ai();

			if (this.collisions.length > 0) {
				hitPos = this.collisions[0].pos.clone();
				hitPos.clampWithin(this.pos, this.size);
				if (onHit) onHit();
				this.collisions.length = 0;
				hitFlash = 2;
			}
		}

		this.draw = function (painter) {
			if (action === "gone") {
				if (goneTimer < goneAnimTime) {
					painter.drawSprite2(this.pos.x, this.pos.y, this.size.x, this.dir, anim.getFrame(), Colors.highlight, false, goneTimer/goneAnimTime, hitPos);
				}
				return;
			}
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
		weightSensor = new Entity(this.pos.clone().moveXY(0,-1), new Pos(10, 1));
	}
	return FallingPlatform;
});