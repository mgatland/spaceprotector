"use strict";
define([], function () {
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

    var Util = {};
    Util.extend = extend;
    Util.track = track;
    return Util;
});