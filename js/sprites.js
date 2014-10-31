"use strict";
define(["painter", "dir", "colors"], function (Painter, Dir, Colors) {
	var Sprites = {};
	var spriteWidth = 10;

	var allSprites = [];
	var scale = 1;

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

	var drawColors = [Colors.bad, Colors.good, Colors.highlight];

	var drawToCanvas = function (frames) {
		//recycle canvas if it exists
		var canvas = frames[0].canvas ? frames[0].canvas : document.createElement("canvas");
        canvas.width = spriteWidth*scale*12;
        //two directions for every color
        canvas.height = spriteWidth*scale*2*drawColors.length;
        var ctx = canvas.getContext("2d");
        var painter = new Painter(ctx, 
        	{width:canvas.width, height:canvas.height},
        	scale);
        for (var i = 0; i < frames.length; i++) {
        	for (var col = 0; col < drawColors.length; col++) {
        		var color = drawColors[col];
        		var y = col * spriteWidth * 2;
	         	painter.drawSpritePixels(spriteWidth*i, y,
	        		spriteWidth, Dir.RIGHT, frames[i], color);
	        	painter.drawSpritePixels(spriteWidth*i, y + spriteWidth,
	        		spriteWidth, Dir.LEFT, frames[i], color);       		
        	}

        	frames[i].scale = scale;
        	frames[i].canvas = canvas;
        	frames[i].position = spriteWidth*i;
        }


	}

	Sprites.loadFramesFromData = function (data) {
		var frames = [];
		var frameSize = spriteWidth * spriteWidth;
		var pointer = 0 + "v1.0:".length;
		var frameToLoad = 0;

		if (data.substring(0,pointer)==="v1.0:") {
			//convert from 12x12 to 10x10
			console.log("loading legacy sprite");
			frames = loadv1Sprite(data);
		} else {
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
		}
		drawToCanvas(frames);
		allSprites.push(frames);
		return frames;
	}

	//Resize all sprite sheets
	Sprites.resize = function (newScale) {
		if (scale === newScale) return;
		scale = newScale;
		allSprites.forEach(function (frames) {
			drawToCanvas(frames);
		})
	}
	return Sprites;
});