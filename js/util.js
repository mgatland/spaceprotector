"use strict";
define([], function () {
  var Util = {};
  Util.track = function (action, label, number) {
  	console.log("_trackEvent: " + action + ", " + label + ", " + number);
  	try {
  		_gaq.push(['_trackEvent',"spaceprotector", action, ""+label, number]);;
  	} catch (e) {

  	}
  }

  Util.extend = function (destination, source) {
    for (var k in source) {
      if (source.hasOwnProperty(k) && !destination.hasOwnProperty(k)) {
        destination[k] = source[k];
      }
    }
    return destination;
  }

  return Util;
});