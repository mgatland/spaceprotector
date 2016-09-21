define([], function () {
    function Gamepad() {

    	var deadZone = 0.5;
    	var oldLeft, oldRight, oldJump, oldShoot, oldStart;
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
    			var left = gamepad.axes[0] < -deadZone || gamepad.buttons[14].pressed;
    			var right = gamepad.axes[0] > deadZone || gamepad.buttons[15].pressed;
    			var jump = gamepad.buttons[0].pressed || gamepad.buttons[3].pressed;
    			var shoot = gamepad.buttons[1].pressed 
    				|| gamepad.buttons[2].pressed
    				|| gamepad.buttons[7].pressed;
                var start = gamepad.buttons[8].pressed || gamepad.buttons[9].pressed;

                //gamepad restart hack
                if (gamepad.buttons[8].pressed && gamepad.buttons[9].pressed) {
                    document.location.reload();
                }

    			simulateKey(left, oldLeft, KeyEvent.DOM_VK_LEFT);
    			simulateKey(right, oldRight, KeyEvent.DOM_VK_RIGHT);
    			simulateKey(jump, oldJump, KeyEvent.DOM_VK_X);
    			simulateKey(shoot, oldShoot, KeyEvent.DOM_VK_Z);
                simulateKey(start, oldStart, KeyEvent.DOM_VK_ENTER);

    			oldLeft = left;
    			oldRight = right;
    			oldShoot = shoot;
    			oldJump = jump;
                oldStart = start;
    		}
    	}
    }
    return Gamepad;
});