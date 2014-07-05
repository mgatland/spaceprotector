"use strict";
define(["pos"], function (Pos) {
	var Entity = function (pos, size) {
		this.pos = pos;
		this.size = size;
		this.live = true;

		this.collisions = []; //transient	
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
	Entity.checkCollision = function (a, b, mode) {
		if (!mode) mode = "both";
		if (a.live === true && b.live === true
			&& a.pos.x < b.pos.x + b.size.x
			&& a.pos.x + a.size.x > b.pos.x
			&& a.pos.y < b.pos.y + b.size.y
			&& a.pos.y + a.size.y > b.pos.y
			) {
			a.collisions.push(b);
			if (mode === "both") b.collisions.push(a);
		}
	}
	return Entity;
});