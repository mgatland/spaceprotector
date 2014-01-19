var Network = {};
(function(){


	Network.networkRole = null;
	//consts
	Network.HOST = "HOST";
	Network.CLIENT = "GUEST";

	var setNetworkMessage = function (message) {
		document.getElementById('netinfo').innerHTML = message;
	}

	var showPeerId = function (id) {
		document.getElementById('netcode').innerHTML = id;
	}

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
	var tryingToJoin = false;

	Network.connectToServer = function (dataCallback) {
		//var peer = new Peer(generatePeerId(), {host: 'spacepro.herokuapp.com', port: 80, debug: 3});
		var peer = new Peer(generatePeerId(), {key: '6ku8444tfj3y2e29', debug: 3});
		peer.on('error', function(err) {
			console.log(err.message + "|" + err.type);
			if (tryingToJoin === true) {
				setNetworkMessage("<b style='color: red'>Could not join the game (Are you sure you entered the right code?) Please refresh the page and try again.</b>");
				tryingToJoin = false;
			}
		});
		peer.on('connection', function(conn) {
			console.log("incoming connection...");
			if (connection != null) {
				console.log("You already have a connection. Ignoring the new one.");
				conn.on('open', function() {
					console.log("Rejecting new connection.");
					conn.send("REJECTED");
				});
				return;
			}
			connection = conn;

			connection.on('open', function(){
				console.log("Someone connected to you!");
				isOpen = true;
				Network.networkRole = Network.HOST;
				setNetworkMessage("You are hosting a game.");
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
		  		setNetworkMessage("<b style='color: red'>Connection lost.</b>");
		  	});
		});

		peer.on('open', function(id) {
  			console.log('My peer ID is: ' + id);
  			showPeerId(id);

  			var myHost = window.prompt("If you want to join someone else's game, enter their code here. Otherwise hit 'cancel' to start your own.");
  			if (myHost) {
  				tryingToJoin = true;
  				var conn = peer.connect(myHost);
				conn.on('open', function(){
					console.log("Connected!");
					tryingToJoin = false;
					connection = conn;
					isOpen = true;
					Network.networkRole = Network.GUEST;
					setNetworkMessage("You have joined a game.");
			  		connection.send('hi!');
				});
				var rejected = false;
				conn.on('data', function(data){
					if (data == "REJECTED") {
						setNetworkMessage("<b style='color: red'>ERROR: You cannot join that game, it is full. Please refresh the page and join a different game.</b>");
						rejected = true;
						connection.close();
					}
					dataCallback(data);
				});
				conn.on('error', function(err) {
					console.log(err.message);
		  		});
		  		conn.on('close', function() {
		  			console.log("Connection lost.");
		  			isOpen = false;
		  			if (rejected === false) { //hack to prevent overwriting error message
		  				setNetworkMessage("<b style='color: red'>Connection lost.</b>");
		  			}
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