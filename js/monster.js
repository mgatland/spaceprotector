"use strict";

var WalkingThing = function (pos, size) {
	this.pos = pos;
	this.size = size;
}

var Monster = function (x, y) {

	var sprite =
			" 111 \n" +
			"1 1 1\n" +
			"11111\n" +
			" 111 \n" +
			" 1 1 \n";

	extend(this, new WalkingThing(new Pos(x, y), new Pos(5, 5)));
	this.update = function () {

	};
	this.draw = function (painter) {
		painter.drawSprite(this.pos.x, this.pos.y, sprite, "#FFFF00");
	};
};