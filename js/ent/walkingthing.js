"use strict";
define(["entity", "dir", "pos", "util"], function (Entity, Dir, Pos, Util) {
	var WalkingThing = function (gs, pos, size) {
		Util.extend(this, new Entity(pos, size));

		this.isAtCliff = function(dir, minHeight) {
			if (dir === Dir.RIGHT) {
				var frontFoot = new Pos(this.pos.x + this.size.x, this.pos.y + this.size.y);
			} else {
				var frontFoot = new Pos(this.pos.x, this.pos.y + this.size.y);
			}
			return (gs.level.cellDepthAt(frontFoot) >= minHeight);
		}

		this.isOnGround = function () {
			var leftFootPos = this.pos.clone().moveXY(0,this.size.y);
			var leftFoot = gs.level.isPointColliding(leftFootPos) || posTouchingPlatform(leftFootPos, this);
			var rightFootPos = this.pos.clone().moveXY(this.size.x-1,this.size.y);
			var rightFoot = gs.level.isPointColliding(rightFootPos) || posTouchingPlatform(rightFootPos, this);
			return (leftFoot || rightFoot);
		}

		var posTouchingPlatform = function(pos, _this) {
			var touching = false;
			gs.monsters.forEach(function (m) {
				if (m.isPlatform) {
					if (Entity.isCollidingPos(m, pos)) {
						touching = true;
					}
				}
			});
			return touching;
		}

		var touchingPlatform = function(_this) {
			var touching = false;
			gs.monsters.forEach(function (m) {
				if (m.isPlatform) {
					if (Entity.isColliding(m, _this, true)) {
						touching = true;
					}
				}
			});
			return touching;
		}

		//x movement, y movement, optional gamestate
		this.tryMove = function (x, y) {
			var _this = this;
			var ok = true;
			while (x != 0) {
				var sign = x > 0 ? 1 : -1;
				this.pos.x += sign;
				x -= sign;
				if (gs.level.isColliding(this) || touchingPlatform(_this)) {
					this.pos.x -= sign;
					x = 0; //no more movement.
					ok = false;
				}
			}
			while (y != 0) {
				var sign = y > 0 ? 1 : -1;
				this.pos.y += sign;
				y -= sign;
				if (gs.level.isColliding(this) || touchingPlatform(_this)) {
					this.pos.y -= sign;
					y = 0; //no more movement.
					ok = false;
				}
			}
			return ok;
		}

		this.getTarget = function () {
			var _this = this;
			var target = null;
			var dist = null;
			gs.players.forEach(function (player) {
				if (!player.hidden) {
					var distToPlayer = _this.pos.distanceTo(player.pos);
					if (target === null || distToPlayer < dist) {
						target = player;
						dist = distToPlayer;
					}
				}
			});
			return target;
		}
	}

	WalkingThing.toData = Entity.toData;
	WalkingThing.fromData = Entity.fromData;
	return WalkingThing;
});
