"use strict";
define(["dir"], function (Dir) {
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

    Pos.prototype.distanceToXY = function (x, y) {
        var xDiff = this.x - x;
        var yDiff = this.y - y;
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

    Pos.prototype.clampWithin = function(coords, size) {
        if (this.x < coords.x) this.x = coords.x;
        if (this.y < coords.y) this.y = coords.y;
        var maxX = coords.x + size.x;
        if (this.x > maxX) this.x = maxX;
        var maxY = coords.y + size.y;
        if (this.y > maxY) this.y = maxY;
        return this;
    }

    Pos.prototype.toData = function () {
        return {x:this.x, y:this.y};
    }

    Pos.fromData = function (data) {
        if (data === null || data === undefined) return data;
        return new Pos(data.x, data.y);
    }
    return Pos;
});
