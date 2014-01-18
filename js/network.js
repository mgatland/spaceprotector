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

	Network.connectToServer = function (dataCallback) {
		var peer = new Peer(generatePeerId(), {host: 'spacepro.herokuapp.com', port: 80});
		peer.on('connection', function(conn) {
			console.log("Someone connected to you!");
			Network.networkRole = Network.HOST;
			connection = conn;
		  	connection.on('data', function(data){
		    	dataCallback(data);
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
					Network.networkRole = Network.GUEST;
			  		connection.send('hi!');
				});
				connection.on('data', function(data){
					dataCallback(data);
				});
  			}
		});
	}

	Network.send = function (data) {
		if (connection) {
			connection.send(data);
		} else {
			//console.error("Network.send called with no connection. Data was " + data);
		}
	}
})();