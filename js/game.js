"use strict";
require(["events", "colors", "network", "bridge", "playingstate",
	"titlestate", "endlevelstate", "camera", "lib/peer"], 
	function(Events, Colors, Network, Bridge, PlayingState,
		TitleState, EndLevelState, Camera) {
	var initGame = function () {

		var level = 0; //TODO: replicate?

		var state = new TitleState();
		Network.connectToServer(function (data) {
			if (state.gotData) {
				state.gotData(data);
			} else {
				console.log("Got data but game is not running. Start it!");
				state = new PlayingState(Events, camera, level);
				state.gotData(data);
			}
		});

		var update = function(keyboard) {

			if (state.transition === true) {
				if (state.endStats) {
					state = new EndLevelState(state.endStats);
					level++;
				} else {
					state = new PlayingState(Events, camera, level);	
				}
			}

			var keys = {};
			keys.left = keyboard.isKeyDown(KeyEvent.DOM_VK_LEFT);
			keys.right = keyboard.isKeyDown(KeyEvent.DOM_VK_RIGHT);
			keys.jumpIsHeld = keyboard.isKeyDown(KeyEvent.DOM_VK_X);
			keys.jumpIsHit = keyboard.isKeyHit(KeyEvent.DOM_VK_X);

			keys.shoot = keyboard.isKeyDown(KeyEvent.DOM_VK_Y) || keyboard.isKeyDown(KeyEvent.DOM_VK_Z);
			keys.shootHit = keyboard.isKeyHit(KeyEvent.DOM_VK_Y) || keyboard.isKeyHit(KeyEvent.DOM_VK_Z);

			keys.start = keyboard.isKeyHit(KeyEvent.DOM_VK_ENTER) || keyboard.isKeyDown(KeyEvent.DOM_VK_RETURN) || keyboard.isKeyHit(KeyEvent.DOM_VK_SPACE);
			keys.esc = keyboard.isKeyHit(KeyEvent.DOM_VK_ESCAPE);

			if (keys.esc) {
				state.paused = !state.paused;
				if (state.paused) {
					document.querySelector("#instructions").classList.remove("hide");
				} else {
					document.querySelector("#instructions").classList.add("hide");
				}
			}
			state.update(keys, Network, Events);
		}

		var draw = function (painter, touch) {
			painter.clear();

			state.draw(painter);
			if (state.showTouchButtons) {
				touch.draw(painter);
			}
		};

		var updateAudio = function (audio, painter) {
			Events.sounds.forEach(function (sound) {
				if (sound.pos === null || painter.isOnScreen(sound.pos.x, sound.pos.y, 10, 10)) {
					audio.play(sound.name);
				}
			});
			Events.sounds.length = 0;
			audio.update();
		}

	var pixelWindow = {width:192, height:104}; //I could fit 200 x 120 on Galaxy s3 at 4x pixel scale
	var camera = new Camera(pixelWindow);
	var scale = 4;

	var desiredFps = 60;
		new Bridge().showGame(update, draw, updateAudio, pixelWindow, scale, desiredFps);
	}

	initGame();
});