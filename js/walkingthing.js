"use strict";
define(["entity", "dir", "pos", "util"], function (Entity, Dir, Pos, Util) {
	var WalkingThing = function (level, pos, size) {
		Util.extend(this, new Entity(pos, size));

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
	WalkingThing.toData = Entity.toData;
	WalkingThing.fromData = Entity.fromData;
	return WalkingThing;
});
