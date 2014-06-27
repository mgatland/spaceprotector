"use strict";
define(["explosion"], function (Explosion) {
	var Shot = function (level, pos, dir, owner) {
		extend(this, new Entity(pos, new Pos(5,1)));
		var _this = this;

		this.dir = dir;

		this.hitsMonsters = (owner === "player");
		this.killPlayerOnTouch = !this.hitsMonsters;

		this.pos.moveXY(2,1);

		if (dir === Dir.LEFT) {
			this.pos.moveXY(-8, 0);
		} else {
			this.pos.moveXY(3, 0);
		}
		this.update = function () {
			if (this.live === false) return;

			this.collisions.forEach(function (other) {
				if (other.ignoreShots !== true) {
					_this.live = false;
				}
			});
			
			this.collisions.length = 0;
			if (this.live === false) return;

			this.pos.moveInDir(this.dir, 2);

			var checkPos;
			if (this.dir === Dir.LEFT) {
				checkPos = this.pos;
			} else {
				checkPos = this.pos.clone().moveXY(this.size.x, 0);
			}
			
			if (level.isPointColliding(checkPos)) {
				if (owner === "player") Events.playSound("hitwall", this.pos.clone());
				this.live = false;
				//Move out of wall to place explosion correctly.
				checkPos.moveInDir(this.dir.reverse, 1);
				var count = 0;
				while (level.isPointColliding(checkPos) && count < 10) {
					checkPos.moveInDir(this.dir.reverse, 1);
					count++;
				}
				//Move to the left side of the explosion
				if (this.dir === Dir.RIGHT) checkPos.moveXY(-4, 0);
				checkPos.moveXY(0, -2); //explosion starts above the shot
				Events.explosion(new Explosion(this.dir, owner, checkPos));
			}
		}
	}
	return Shot;
});