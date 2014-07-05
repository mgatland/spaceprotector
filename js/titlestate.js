"use strict";
define(["colors"], function (Colors) {
	var TitleState = function () {
		this.update = function (keys, painter, Network, Events) {
			if (keys.start) {
				this.transition = true;
			}
		};
		this.draw = function (painter) {
			painter.drawText(40, 20, "Space Protector", Colors.good);
			painter.drawText(40, 50, "> Press Start  ", Colors.good);
			painter.drawText(10, 84, "(c)1986 new north road", Colors.good);
			painter.drawAbsRect(0, 0, 192, 104, Colors.bad, 10);
		};
	}
	return TitleState;
});