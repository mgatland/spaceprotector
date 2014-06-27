"use strict";
define([], function () {
	var ctx = webkitAudioContext ? new webkitAudioContext(): new AudioContext();
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
	            loaded++;
	        }); 
	    }; 
	    req.send(); 
	}

	//play the loaded file 
	function play(name) { 
		if (loaded < soundNames.length) return; //haven't loaded yet
    //create a source node from the buffer 
    var src = ctx.createBufferSource();  
    src.buffer = sounds[name]; 
    src.connect(gainNode);
    //play immediately 
    src.noteOn(0); 
	}

	return {play: play};
});