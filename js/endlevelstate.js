"use strict";
define(["colors"], function (Colors) {
	var EndLevelState = function (stats) {

		var age = 0;

		this.update = function (keys) {
			age++;
			if (age >= 60 && (keys.start || keys.up || keys.left || keys.right || keys.down ||
				keys.shoot || keys.jumpIsHeld)) {
				this.transition = true;
			}
		};

		var pad = function (data) {
			var text = "" + data;
			while (text.length < 4) {
				text = " " + text;
			}
			return text;
		}

		var formatTime = function (time) {
			var minutes = Math.floor(time/60);
			var seconds = Math.floor(time) - minutes * 60;
			var secTxt = "" + seconds;
			if (secTxt.length === 1) secTxt = "0" + secTxt;
			return minutes + ":" + secTxt;
		}

		this.draw = function (painter) {
			painter.drawAbsRect(0, 0, 192, 104, Colors.blank);
			painter.drawText(40, 20, "Level Complete", Colors.good);
			painter.drawText(40, 50, "Resets: " + pad(stats.deaths), Colors.good);
			painter.drawText(40, 60, "Time:   " + formatTime(stats.time), Colors.good);
			painter.drawText(40, 70, "Mercy:  " + pad(stats.mercy), Colors.good);
		};
	}
	return EndLevelState;
});