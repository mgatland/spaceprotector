"use strict";
define([], function () {
	function doISupportFullScreen() {
        return (document.documentElement.requestFullscreen
            || document.documentElement.msRequestFullscreen
            || document.documentElement.mozRequestFullScreen
            || document.documentElement.webkitRequestFullscreen);
    }
    //From MDN
    function toggleFullScreen() {
      if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    };

    var fullscreenTools = {};
    fullscreenTools.goFullscreenIfRequired = function (canvas, pixelWindow, pixelSize) {
    	//If the game can't fit full size in any orientation,
    	//then we enable full screen mode (if we can.)
    	var minDimension = Math.min(window.innerWidth, window.innerHeight);
    	var maxDimension = Math.max(window.innerWidth, window.innerHeight);
    	var widthIsOK = maxDimension >= pixelWindow.width * pixelSize;
    	var heightIsOK = minDimension >= pixelWindow.height * pixelSize;
    	if (!widthIsOK || !heightIsOK) {
    		if (doISupportFullScreen()) {
    			toggleFullScreen();
    		}
    	}
    }

    return fullscreenTools;
});