define([], function () {
    function Gamepad() {

    	var deadZone = 0.01;
    	var oldLeft, oldRight, oldJump, oldShoot;
    	var downFunc, upFunc;
    	this.setCallbacks = function setCallbacks (down, up) {
    		downFunc = down;
    		upFunc = up;
    	}

    	function simulateKey(state, oldState, keyCode) {
    		if (state && !oldState) downFunc(keyCode);
    		if (!state && oldState) upFunc(keyCode);
    	};

    	this.update = function update () {
    		var gamepad = navigator.getGamepads &&  navigator.getGamepads()[0];
    		if (gamepad) {
    			var left = gamepad.axes[0] < -deadZone;
    			var right = gamepad.axes[0] > deadZone;
    			var jump = gamepad.buttons[0].value > deadZone || gamepad.buttons[2].value > deadZone;
    			var shoot = gamepad.buttons[1].value > deadZone 
    				|| gamepad.buttons[3].value > deadZone
    				|| gamepad.buttons[5].value > deadZone;

    			simulateKey(left, oldLeft, KeyEvent.DOM_VK_LEFT);
    			simulateKey(right, oldRight, KeyEvent.DOM_VK_RIGHT);
    			simulateKey(jump, oldJump, KeyEvent.DOM_VK_X);
    			simulateKey(shoot, oldShoot, KeyEvent.DOM_VK_Z);

    			oldLeft = left;
    			oldRight = right;
    			oldShoot = shoot;
    			oldJump = jump;
    		}
    	}
    }
    return Gamepad;
});