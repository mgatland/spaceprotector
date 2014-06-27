var Dir = {};
Dir.UP = {isHorizontal: false, x:0};
Dir.DOWN = {isHorizontal: false, x:0};
Dir.LEFT = {isHorizontal: true, x:-1};
Dir.RIGHT = {isHorizontal: true, x:1};

Dir.UP.reverse = Dir.DOWN;
Dir.DOWN.reverse = Dir.UP;
Dir.LEFT.reverse = Dir.RIGHT;
Dir.RIGHT.reverse = Dir.LEFT;

Dir.list = [Dir.UP, Dir.DOWN, Dir.LEFT, Dir.RIGHT];

Dir.fromId = function (id) {
    return Dir.list[id];
}

Dir.toId = function (dir) {
    return Dir.list.indexOf(dir);
}

//Pos is a mutable x and y coordinate pair. Use clone() to clone it.
var Pos = function (x, y) {
	this.x = x;
	this.y = y;
}

Pos.prototype.toString = function () {
    return "(" + this.x + "," + this.y + ")";
}

Pos.prototype.distanceTo = function (other) {
    var xDiff = this.x - other.x;
    var yDiff = this.y - other.y;
    return Math.floor(Math.sqrt(xDiff * xDiff + yDiff * yDiff));
}

Pos.prototype.clone = function () {
    return new Pos(this.x, this.y);
}

Pos.prototype.multiply = function (value) {
    this.x *= value;
    this.y *= value;
    return this;
}

Pos.prototype.angleTo = function (other) {
    var angle = (Math.atan2(other.y - this.y, other.x - this.x) * 180 / Math.PI);
    angle += 90;
    return angle;
}

Pos.prototype.moveAtAngle = function (angle, speed) {
    var xSpeed = (speed * Math.sin(3.14159 / 180.0 * angle));
    var ySpeed = (speed * -Math.cos(3.14159 / 180 * angle));
    this.x += xSpeed;
    this.y += ySpeed;
    return this;
}

Pos.prototype.moveInDir = function (dir, distance) {
    switch (dir) {
        case Dir.UP: this.y -= distance; break;
        case Dir.DOWN: this.y += distance; break;
        case Dir.LEFT: this.x -= distance; break;
        case Dir.RIGHT: this.x += distance; break;
    }
    return this;
}

Pos.prototype.moveXY = function (x, y) {
    this.x += x;
    this.y += y;
    return this;
}

Pos.prototype.moveByPos = function (pos) {
    this.x += pos.x;
    this.y += pos.y;
    return this;
}

Pos.prototype.floor = function () {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
}

Pos.prototype.toData = function () {
    return {x:this.x, y:this.y};
}

Pos.fromData = function (data) {
    return new Pos(data.x, data.y);
}

//End of Pos.prototype


var track = function (action, label, number) {
	console.log("_trackEvent: " + action + ", " + label + ", " + number);
	try {
		_gaq.push(['_trackEvent',"cerulean", action, ""+label, number]);;
	} catch (e) {

	}
}

var extend = function (destination, source) {
  for (var k in source) {
    if (source.hasOwnProperty(k) && !destination.hasOwnProperty(k)) {
      destination[k] = source[k];
    }
  }
  return destination;
}