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
            function getButton (num) {
                return (gamepad.buttons.length > num && gamepad.buttons[num].pressed);
            }
    		if (gamepad) {
    			var left = gamepad.axes[0] < -deadZone || getButton(14);
    			var right = gamepad.axes[0] > deadZone || getButton(15);
    			var jump = getButton(0) || getButton(3);
    			var shoot = getButton(1)
    				|| getButton(2)
    				|| getButton(7);
                var start = getButton(8) || getButton(9);

                //gamepad restart hack
                if (getButton(8) || getButton(9)) {
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