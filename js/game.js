"use strict";
(function() {

	window.initGame = function () {

		var man = {};
		man.pos = new Pos(10,10);

		var update = function(keyboard) {
			var left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
			var right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);

			if (left && !right) {
				man.pos.x--;
			} else if (right && !left) {
				man.pos.x++;
			}
		}

		var man0 =
		"  1  \n" +
		" 111 \n" +
		"1 1 1\n" +
		" 1 1 \n" +
		" 1 1 \n";

		var draw = function (painter) {
			painter.clear();
			painter.drawSprite(man.pos.x,man.pos.y, man0, "#FFFF00");
		}

        var pixelWindow = {width:192, height:104};
        var scale = 4;

        var desiredFps = 60;
		new Bridge().showGame(update, draw, pixelWindow, scale, desiredFps);
	}
})();

