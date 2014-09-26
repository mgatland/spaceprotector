"use strict";
define([],
	function () {

	var EditingState = function (camera, levelEditor) {
		var tileSize = 10;

		this.update = function (keys) {
			levelEditor.update(keys);
		};

		this.draw = function (painter) {
			painter.setPos(camera.pos); //only needs to be set once per level
			levelEditor.draw(painter);
		};

		this.activated = function () {
			levelEditor.activated();
		}

		this.deactivated = function () {
			levelEditor.deactivated();
		}
	};

	return EditingState;
});