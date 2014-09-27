"use strict";
define([], function () {
	var Sprites = {};
	var spriteWidth = 10;

	var loadv1Sprite = function (data) {
		var frames = [];
		var frameSize = spriteWidth * spriteWidth;
		var pointer = 0 + "v1.0:".length;
		var frameToLoad = 0;

		while (pointer < data.length) {
			frames[frameToLoad] = [];
			frames[frameToLoad].width = spriteWidth;
			var frameEnd = pointer + 12*10; //hacked to read first 10 rows of the old format.
			var xCount = 0;
			while (pointer < frameEnd) {
				var pixel = parseInt(data.slice(pointer, pointer+1));
				if (isNaN(pixel)) pixel = 0;
				frames[frameToLoad].push(pixel);
				pointer++;
				xCount++;
				if (xCount===10) {
					//skip 2 characters at end of each row
					pointer += 2;
					xCount = 0;
				}
			}
			pointer += 12*2; //skip two rows.
			frameToLoad++;
		}
		return frames;
	}

	Sprites.loadFramesFromData = function (data) {
		var frames = [];
		var frameSize = spriteWidth * spriteWidth;
		var pointer = 0 + "v1.0:".length;
		var frameToLoad = 0;

		if (data.substring(0,pointer)==="v1.0:") {
			//convert from 12x12 to 10x10
			console.log("loading legacy sprite");
			return loadv1Sprite(data);
		}

		//normal, v2.0 sprites:
		while (pointer < data.length) {
			frames[frameToLoad] = [];
			frames[frameToLoad].width = spriteWidth;
			var frameEnd = pointer + frameSize;
			while (pointer < frameEnd) {
				frames[frameToLoad].push(parseInt(data.slice(pointer, pointer+1)));
				pointer++;
			}
			frameToLoad++;
		}
		return frames;
	}
	return Sprites;
});