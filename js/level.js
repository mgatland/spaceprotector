"use strict";
var Level = function(mapData, tileSize) {
	var level = this; //for use in private methods
	var map = [];

	var drawEdge = function(x, y, checkX, checkY, mode, painter) {
		if (!level.isSolid(x+checkX, y+checkY)) {
			var drawOffsetX = (checkX === 1) ? tileSize - 1 : 0;
			var drawOffsetY = (checkY === 1) ? tileSize - 1 : 0;
			var width;
			var height;
			if (mode === "horizontal") {
				width = 10;
				height = 1;
			} else if (mode === "vertical") {
				width = 1;
				height = 10;
			} else { //corner
				width = 1;
				height = 1;
			}
			painter.drawRect(x*tileSize+drawOffsetX,y*tileSize+drawOffsetY, width, height, "#FFFF00");
		}
	}

	var drawTile = function (x, y, painter) {
		drawEdge(x, y, 0, -1, "horizontal", painter);
		drawEdge(x, y, 0, 1, "horizontal", painter);
		drawEdge(x, y, -1, 0, "vertical", painter);
		drawEdge(x, y, +1, 0, "vertical", painter);
		drawEdge(x, y, -1, -1, "corner", painter);
		drawEdge(x, y, +1, -1, "corner", painter);
		drawEdge(x, y, -1, +1, "corner", painter);
		drawEdge(x, y, +1, +1, "corner", painter);
	}

	var loadMap = function (mapData) {
		map = [];
		var n = 0;
		var x = 0;
		var y = 0;
		map[y] = [];
		while (mapData[n]) {
			if (mapData[n]==="m") {
				Events.monster(new Monster(level, x*tileSize, y*tileSize));
				map[y][x] = 0;
			}
			if (mapData[n]==="O") {
				map[y][x] = 1;
			}
			if (mapData[n]===" ") {
				map[y][x] = 0;
			}
			if (mapData[n] === "\n") {
				x = 0;
				y++;
				map[y] = [];
			} else {
				x++;
			}
			n++;
		}
	}

	this.isColliding = function (player) {
		//find out which cell each corner is in.
		//If a corner is inside a solid square, return true.
		var corner = player.pos.clone();
		if (this.isPointColliding(corner)) return true;
		if (this.isPointColliding(corner.moveXY(player.size.x-1,0))) return true;
		if (this.isPointColliding(corner.moveXY(0,player.size.y-1))) return true;
		if (this.isPointColliding(corner.moveXY(-player.size.x+1,0))) return true;
		return false;
	}
	this.isPointColliding = function (pos) {
		var x = Math.floor(pos.x / tileSize);
		var y = Math.floor(pos.y / tileSize);
		if (map[y][x] === 1) return true;
		return false;
	}
	this.isSolid = function(x, y) {
		if (x < 0) return true;
		if (y < 0) return true;
		if (map[y][x] === 0) return false;
		return true;
	}
	this.draw = function(painter) {
		map.forEach(function (row, y) {
			row.forEach(function (value, x) {
				if (value === 1) {
					drawTile(x, y, painter);
				}
			});
		});
	}

	loadMap(mapData);
};


