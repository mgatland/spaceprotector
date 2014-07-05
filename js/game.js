"use strict";
require(["events", "colors", "network", "bridge", "playingstate", "lib/peer"], 
	function(Events, Colors, Network, Bridge, PlayingState) {
	var initGame = function () {

		var playingState = new PlayingState();
		Network.connectToServer(playingState.gotData);

		var winTimer = 0; //TODO: move into game state

		var update = function(keyboard, painter) {

			if (Events.wonLevel) {
				winTimer++;
			}

			var keys = {};
			keys.left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
			keys.right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
			keys.jumpIsHeld = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
			keys.jumpIsHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

			keys.shoot = keyboard.isKeyDown(KeyEvent.DOM_VK_Y) || keyboard.isKeyDown(KeyEvent.DOM_VK_Z);
			keys.shootHit = keyboard.isKeyHit(KeyEvent.DOM_VK_Y) || keyboard.isKeyHit(KeyEvent.DOM_VK_Z);

			playingState.update(keys, painter, Network, Events);
		}

		var draw = function (painter) {
			painter.clear();

			playingState.draw(painter);

			if (winTimer > 0) {
				var barHeight = Math.min(winTimer*2, 45);
				var barY = winTimer * 2;
				painter.drawAbsRect(0, pixelWindow.height/2-barY, pixelWindow.width, barHeight, Colors.good);
				painter.drawAbsRect(0, pixelWindow.height/2+barY-barHeight, pixelWindow.width, barHeight, Colors.good);
			}
		};

		var updateAudio = function (audio, painter) {
			Events.sounds.forEach(function (sound) {
				if (sound.pos === null || painter.isOnScreen(sound.pos.x, sound.pos.y, 10, 10)) {
					audio.play(sound.name);
				}
			});
			Events.sounds.length = 0;
		}

	var pixelWindow = {width:192, height:104}; //I could fit 200 x 120 on Galaxy s3 at 4x pixel scale
	var scale = 4;

	var desiredFps = 60;
		new Bridge().showGame(update, draw, updateAudio, pixelWindow, scale, desiredFps);
	}

	initGame();
});