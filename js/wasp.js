"use strict";
define(["sprites", "spritedata", "util", "monster", "pos", "events"], 
	function (Sprites, SpriteData, Util, Monster, Pos, Events) {
	var sprites = Sprites.loadFramesFromData(SpriteData.wasp);
	var anims = {
		flying: {frames: [0,1,2,3,4,5], delay: 6}
	};

	var Wasp = function (level, x, y) {
		var _this = this;

		//constants
		var initialHealth = 1;
		var moveDelay = 1;
		var seeDistance = 10*10;

		//state
		var moveTimer = 0;
		var action = "waiting";

		var onHit = function (collisions) {
		}

		function canSee (thing) {
		}

		var ai = function (gs) {
			//waiting: wake if player is close
			//awake: move towards player
			//pick a pseudorandom approach height
		}

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

		Util.extend(this, new Monster(level, x, y, 10, 10, sprites, anims, ai, initialHealth, onHit));
		this.startAnimation("flying");
	}
	return Wasp;
});