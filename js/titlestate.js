"use strict";
define(["colors"], function (Colors) {
	var TitleState = function () {
		var fakeLoadingProgress = 0;
		var maxLoadingProgress = 20;
		var frame = 0;
		this.update = function (keys, painter, Network, Events) {
			if (keys.start || keys.up || keys.left || keys.right || keys.down ||
				keys.shoot || keys.jumpIsHeld) {
				this.transition = true;
			}
			if (fakeLoadingProgress < maxLoadingProgress) {
				fakeLoadingProgress+= 2;
			}
			if (fakeLoadingProgress >= maxLoadingProgress) {
				frame++;
			}
		};

		function typeText(painter, x, y, text, trimLength) {
			painter.drawText(x, y, text.substring(0, trimLength), Colors.bad);
		}

		var messages = [
			"incoming transmission",
			"a rogue scientist has",
			"found terrible powers",
			"they must be stopped!",
			"target last detected",
			" in darkest fortress",
			"go now with our trust",
			" and stop this evil",
			"before it is too late",
			""];

		this.draw = function (painter) {
			if (fakeLoadingProgress >= maxLoadingProgress) {
				painter.drawText(40, 20, "Space Protector", Colors.good);
				if (frame % 90 < 70) {
					painter.drawText(40, 50, "> Press Start  ", Colors.good);
				} else {
					painter.drawText(40, 50, ">", Colors.good);
				}

				var msgFrame = Math.floor(frame/5/60);
				var msg = messages[msgFrame%messages.length];
				if (frame % (5*60) > 60) {
					var chars = frame % (5*60) - 60;
					typeText(painter, 20, 80, msg, chars);
				}
			}
			if (frame < 60) {
				painter.drawText(20, 74, Array(fakeLoadingProgress+1).join("…"), Colors.good);
			}
			painter.drawAbsRect(0, 0, 192, 104, Colors.bad, 10);
		};
	}
	return TitleState;
});