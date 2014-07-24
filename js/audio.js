"use strict";
define([], function () {

	if (typeof webkitAudioContext != "undefined") {
		var ctx = new webkitAudioContext();
	} else if (typeof AudioContext != "undefined") {
		var ctx = new AudioContext();
	} else {
		var doNothing = function () {};
		console.log("No audio supported.");
		return {play: doNothing, unmuteIOSHack:doNothing};
	}

	var soundNames = ["pshoot", "mshoot", "mdead", "mhit", "pdead", 
	"hitwall", "checkpoint", "jump", "land", "winlevel"];
	var loaded = 0;
	var sounds = {};

	var gainNode = ctx.createGain();
	gainNode.connect(ctx.destination);
	gainNode.gain.value = 0.1;

	soundNames.forEach(function (name) {
		loadFile(name);
	});

	function loadFile(name) { 
	    var req = new XMLHttpRequest(); 
	    req.open("GET","sounds/" + name + ".wav",true); 
	    req.responseType = "arraybuffer"; 
	    req.onload = function() { 
	        //decode the loaded data 
	        ctx.decodeAudioData(req.response, function(buffer) { 
	            sounds[name] = buffer;
	            sounds[name].coolDown = 0;
	            loaded++;
	        }); 
	    }; 
	    req.send(); 
	}

	//play the loaded file 
	function play(name) { 
		if (loaded < soundNames.length) return; //haven't loaded yet
		if (sounds[name].coolDown > 0) return ; //Don't repeat a sound too quickly.	
		sounds[name].coolDown = 3;
	    //create a source node from the buffer 
	    var src = ctx.createBufferSource();  
	    src.buffer = sounds[name]; 
	    src.connect(gainNode);
	    //play immediately 
	    src.noteOn ? src.noteOn(0) : src.start(0);
	}

	function update() {
		Object.keys(sounds).forEach(function(key) {
		    if (sounds[key].coolDown > 0) sounds[key].coolDown--;
		});
	}

	function unmuteIOSHack() {
		console.log("unmute sound on iOS");
		// create and play an empty buffer
		var buffer = ctx.createBuffer(1, 1, 22050);
		var src = ctx.createBufferSource();
		src.buffer = buffer;
		src.connect(ctx.destination);
		src.noteOn ? src.noteOn(0) : src.start(0);
		//if this was called on a user action, sound will be enabled.
	}

	return {play: play, unmuteIOSHack:unmuteIOSHack, update:update};
});