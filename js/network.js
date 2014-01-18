(function(){
	var generatePeerId = function () {
		//http://stackoverflow.com/a/1349426/439948
	   	var text = "";
	   	var possible = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

	var connectToServer = function () {
		var peer = new Peer(generatePeerId(), {host: 'spacepro.herokuapp.com', port: 80});
		var connection;
		peer.on('connection', function(conn) {
			console.log("Someone connected to you!");
			connection = conn;
		  	connection.on('data', function(data){
		    	console.log("msg: " + data);
		    	connection.send("polo!");
		  	});
		});

		peer.on('open', function(id) {
  			console.log('My peer ID is: ' + id);

  			var myHost = window.prompt("Connect to someone else's game? enter their peer ID.");
  			if (myHost) {
  				connection = peer.connect(myHost);
				connection.on('open', function(){
					console.log("Connected!");
			  		connection.send('hi!');
			  		window.setInterval(function () {
			  			connection.send("hi...");
			  		}, 1000);
				});
				connection.on('data', function(data){
					console.log("msg: " + data);
				});
  			}
		});
	}

	window.connectToServer = connectToServer;
})();