"use strict";

//global
if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
        DOM_VK_RETURN: 13,
        DOM_VK_ENTER: 14,
        DOM_VK_SPACE: 32,
        DOM_VK_SHIFT: 16,
        DOM_VK_ESCAPE: 27,

        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,

        DOM_VK_W: 87,
        DOM_VK_A: 65,
        DOM_VK_S: 83,
        DOM_VK_D: 68,

        DOM_VK_Q: 81,
        DOM_VK_L: 76,

        DOM_VK_M: 77,
        DOM_VK_X: 88,

        DOM_VK_P: 80
    }
}

function Keyboard() {

    var keysDown = {};
    var keysHit = {};

    window.addEventListener("keydown", function (e) {
        if (!keysDown[e.keyCode]) { //ignore repeated triggering of keyhit when key is held down
            keysDown[e.keyCode] = true;
            keysHit[e.keyCode] = true;
        }
        switch(e.keyCode) {
            case KeyEvent.DOM_VK_DOWN:
            case KeyEvent.DOM_VK_UP:
            case KeyEvent.DOM_VK_RIGHT:
            case KeyEvent.DOM_VK_LEFT:
            e.preventDefault();
            break;
        }
    }, false);
    window.addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode];
    }, false);

    this.isKeyDown = function (keyCode) {
        return keysDown[keyCode];
    }

    this.isKeyHit = function (keyCode) {
        return keysHit[keyCode];
    }

    this.update = function () {
        keysHit = {};
    }

}