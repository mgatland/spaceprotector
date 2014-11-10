"use strict";
require(["events", "colors", "network", "bridge", "playingstate",
	"titlestate", "endlevelstate", "camera", "audio", 
	"editingstate", "lib/peer"], 
	function(Events, Colors, Network, Bridge, PlayingState,
		TitleState, EndLevelState, Camera, Audio, EditingState) {
	var initGame = function () {

		var level = 0; //TODO: replicate?

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
					if (level === 1) state.endStats.lastLevel = true;
					state = new EndLevelState(state.endStats);
					level++;
				} else if (level === 2) {
					document.location.reload();
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

		var minWindow = {width:192, height:104};
		var pixelWindow = {width:192, height:104};
		var camera = new Camera(minWindow);
		var desiredFps = 60;
		var bridge = new Bridge(pixelWindow, minWindow, desiredFps);
		var touch = bridge.createTouch();
		var keyboard = bridge.createKeyboard(touch);
		var painter = bridge.createPainter();
		var editorState = null;
		var gameState = null;

		var state = new TitleState(pixelWindow);

		var bridgeUpdate = function () {

			if (!editorState && keyboard.isKeyDown(KeyEvent.DOM_VK_E) &&
				keyboard.isKeyDown(KeyEvent.DOM_VK_L)) {
				var levelEditor = bridge.createLevelEditor(
					camera, Events, keyboard);
				levelEditor.setLevel(state.getLevel());
				editorState = new EditingState(camera, levelEditor);
				gameState = state;
				state = editorState;
			}

			keyboard.preUpdate();

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_P)) {
				bridge.resetWorstStats();
			}

			if (keyboard.isKeyHit(KeyEvent.DOM_VK_E) 
				&& editorState != null) {
				if (editorState === state) {
					editorState.deactivated();
					state = gameState;
				} else {
					editorState.activated();
					state = editorState;
				}
			}
			
			update(keyboard, painter);
			keyboard.postUpdate();
			touch.update();
		}
		var bridgeDraw = function () {
			draw(painter, touch);
			updateAudio(Audio, painter);
		}
		bridge.showGame(bridgeUpdate, bridgeDraw);
	}

	initGame();
});