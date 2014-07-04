"use strict";
define([], function () {

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
    return Dir;
});
