"use strict";
define(["pos", "dir"], function (Pos, Dir) {
	var Entity = function (pos, size) {
		this.pos = pos;
		this.size = size;
		this.live = true;

		this.collisions = []; //transient

		this.getCenter = function () {
			return this.pos.clone().moveXY(
				Math.floor(this.size.x/2),
				Math.floor(this.size.y/2));
		}
	}
	Entity.toData = function (ent, data) {
		data.pos = ent.pos.toData();
		data.size = ent.size.toData();
		data.live = ent.live;
	}
	Entity.fromData = function (entity, data) {
		entity.pos = Pos.fromData(data.pos);
		entity.size = Pos.fromData(data.size);
		entity.live = data.live;
	}

	var checkOnePixel = function (entity, x, y) {
		var sprite = entity.getFrame();
		var spriteX = x - entity.pos.x;
		if (entity.dir === Dir.LEFT) {
			spriteX = entity.size.x - spriteX - 1;
		};
		var spriteY = y - entity.pos.y;
		var i = spriteX + spriteY * sprite.width;
		return (sprite[i] !== 0);
	}

	var checkPixelCollision = function (a, b) {
		if (!a.getFrame || !b.getFrame) return true;
		//find overlapping rectangle
		var x1 = Math.max(a.pos.x, b.pos.x);
		var y1 = Math.max(a.pos.y, b.pos.y);
		var x2 = Math.min(a.pos.x + a.size.x, b.pos.x + b.size.x);
		var y2 = Math.min(a.pos.y + a.size.y, b.pos.y + b.size.y);
		for (var x = x1; x < x2; x++) {
			for (var y = y1; y < y2; y++) {
				if (checkOnePixel(a, x, y) && 
					checkOnePixel(b, x, y)) {
					return true;
				}
			}
		}
		return false;
	}

	Entity.checkCollision = function (a, b, mode) {
		if (!mode) mode = "both";
		if (a.live === true && b.live === true
			&& a.pos.x < b.pos.x + b.size.x
			&& a.pos.x + a.size.x > b.pos.x
			&& a.pos.y < b.pos.y + b.size.y
			&& a.pos.y + a.size.y > b.pos.y
			) {
			if (checkPixelCollision(a, b)) {
				a.collisions.push(b);
				if (mode === "both") b.collisions.push(a);				
			}
		}
	}
	return Entity;
});