"use strict";
var spriteWidth = 12;

var loadFramesFromData = function (frames, data) {
	var frameSize = spriteWidth * spriteWidth;
	var pointer = 0 + "v1.0:".length;
	var frameToLoad = 0;
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
}