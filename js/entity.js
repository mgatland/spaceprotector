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
	return Entity;
});