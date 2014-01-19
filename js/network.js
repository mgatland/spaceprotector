var Network = {};
(function(){


	Network.networkRole = null;
	//consts
	Network.HOST = "HOST";
	Network.CLIENT = "GUEST";

	var generatePeerId = function () {
		//http://stackoverflow.com/a/1349426/439948
	   	var text = "";
	   	var possible = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

	var connection;
	var isOpen = false;

	Network.connectToServer = function (dataCallback) {
		//var peer = new Peer(generatePeerId(), {host: 'spacepro.herokuapp.com', port: 80, debug: 3});
		var peer = new Peer(generatePeerId(), {key: '6ku8444tfj3y2e29', debug: 3});
		peer.on('error', function(err) {
			console.log(err.message + "|" + err.type);
		});
		peer.on('connection', function(conn) {
			console.log("incoming connection...");
			connection = conn;

			connection.on('open', function(){
				console.log("Someone connected to you!");
				isOpen = true;
				Network.networkRole = Network.HOST;
				document.getElementById('netinfo').innerHTML = "You are hosting a game."
				connection.send('Thanks for joining!');
			});

		  	connection.on('data', function(data){
		    	dataCallback(data);
		  	});
		  	connection.on('error', function(err) {
				console.log(err.message);
		  	});
		  	connection.on('close', function() {
		  		console.log("Connection lost.");
		  		isOpen = false;
		  	});
		});

		peer.on('open', function(id) {
  			console.log('My peer ID is: ' + id);
  			document.getElementById('netcode').innerHTML = id; //TODO: don't manipulate the DOM in this file.

  			var myHost = window.prompt("If you want to join someone else's game, enter their code here. Otherwise hit 'cancel' to start your own.");
  			if (myHost) {
  				connection = peer.connect(myHost);
				connection.on('open', function(){
					console.log("Connected!");
					isOpen = true;
					Network.networkRole = Network.GUEST;
					document.getElementById('netinfo').innerHTML = "You have joined a game."
			  		connection.send('hi!');
				});
				connection.on('data', function(data){
					dataCallback(data);
				});
				connection.on('error', function(err) {
					console.log(err.message);
		  		});
		  		connection.on('close', function() {
		  			console.log("Connection lost.");
		  			isOpen = false;
		  		});
  			}
		});
	}

	Network.send = function (data) {
		if (connection && isOpen) {
			connection.send(data);
		}
	}
})();