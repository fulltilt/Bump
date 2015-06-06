'use strict';

app.controller('MapController', function($scope, FURL, $ionicPopup, Auth) {
	var fb = new Firebase(FURL);
	var geoFire = new GeoFire(fb.child('users'));
	$scope.currentUser = Auth.user;
	console.log($scope.currentUser)

	var SFMarket = [37.785326, -122.405696]
    var myLatlng = new google.maps.LatLng(SFMarket[0], SFMarket[1]);

    var mapOptions = {
	    center: myLatlng,
	    zoom: 16,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
    };

	var map = new google.maps.Map(document.getElementById('map'), mapOptions);

	// Setup Bump confirm dialog
	var showConfirm = function(username) {
        var confirmPopup = $ionicPopup.confirm({
         	title: 'Bump?',
         	template: 'Give ' + username + ' a Bump?'
        });

   		confirmPopup.then(function(res) {
         	if (res) {
          		var obj = {
            		datetime: Firebase.ServerValue.TIMESTAMP,
            		username: username
          		};


bumps.transaction(function(bumpCount) {
return bumpCount + 1;
});

          		var bumpsRef = fb.child('user_bumps');
          		bumpsRef.push(obj);
		        //$firebase(fb.child('user_bumps').child(username))//.$push(obj);
		        //$firebase(ref.child('user_bumps').child(username)).$push(obj);
         	} else {
           		console.log('Nope.');
         	}
   		});
   	};

  	function initialize() {
    	// Get users current location. Once the location has been determined, setup the app
    	navigator.geolocation.getCurrentPosition(function (pos) {
      		var currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
          		cX = currentLocation.A,
          		cY = currentLocation.F;
      		map.setCenter(currentLocation);

		    // center the map whenever the current user's position changes. Also update the center of the inner Bump radius
			google.maps.event.addListener(currentLocation, 'position_changed', function () {
		        map.panTo(currentLocation.getPosition());
		        bumpCircle.setCenter(currentLocation.getPosition());
		    });

			// create marker for User's location
			var myLocation = new google.maps.Marker({
		        position: currentLocation,
		        map: map,
		        title: 'Current Location'
		    });

		    // Create a draggable circle centered on the map. This circle will display users within a half a kilometer radius
		    var radiusInKm = 0.5;
		    var circle = new google.maps.Circle({
		        strokeColor: "#6D3099",
		        strokeOpacity: 0.7,
		        strokeWeight: 1,
		        fillColor: "#B650FF",
		        fillOpacity: 0.35,
		        map: map,
		        center: currentLocation,
		        radius: ((radiusInKm) * 1000),
		        draggable: true
		    });
	      
	      	// initate inner radius where one can Bump
		    var bumpRadiusInKm = 0.07;
		    var bumpCircle = new google.maps.Circle({
		        strokeColor: "#6D3099",
		        strokeOpacity: 0.7,
		        strokeWeight: 1,
		        fillColor: "#00FF00",
		        fillOpacity: 0.35,
		        map: map,
		        center: currentLocation,
		        radius: ((bumpRadiusInKm) * 1000),
		        draggable: false
		    });

			/*************/
			/*  GEOQUERY */
			/*************/
			// Keep track of all of the users currently within the outer bump radius query
	  		var usersInQuery = {};

	        // Create a new GeoFire query instance for outer radius
	        var geoQuery = geoFire.query({
	        	center: [currentLocation.A, currentLocation.F],
	        	radius: radiusInKm
	        });

		    // Create a new GeoFire query instance for inner Bump radius
		    var bumpQuery = geoFire.query({
		        center: [currentLocation.A, currentLocation.F],
		        radius: bumpRadiusInKm
		    });

		    // if other users enter the Bump radius, show Bump dialog
			bumpQuery.on("key_entered", function(username, userLocation) {
				showConfirm(username);
			});

	      	// everytime the user drags the outer circle, listener update the query. To ensure there's not too many calls, 
		    // using LoDash's debounce function
			var updateCriteria = _.debounce(function() {
				var latLng = circle.getCenter();
				geoQuery.updateCriteria({
					center: [latLng.lat(), latLng.lng()],
					radius: radiusInKm
				});
			}, 10);
			google.maps.event.addListener(circle, "drag", updateCriteria);

			// Adds new user markers to the map when they enter the query
			geoQuery.on("key_entered", function(username, userLocation) {
				console.log('Entered:',username, userLocation)
				// Specify that the user has entered this query
				usersInQuery[username] = true;

				// Look up the user's data in the data set
				fb.child("users").child(username).once("value", function(dataSnapshot) {
					// Get the user data from Firebase
					var user = dataSnapshot.val();

					// If the user has not already exited this query in the time it took to look up its data in the firebase, add it to the map
					if (user !== null && usersInQuery[username] === true) {
						// Add the user to the list of users in the query
						usersInQuery[username] = user;

						// Create a new marker for the user
						user.marker = new google.maps.Marker({
							position: new google.maps.LatLng(userLocation[0], userLocation[1]),
							map: map,
							optimized: true,
							title: username
						});
					}
				});    
			});

			// Move users markers on the map when their location within the query changes
			geoQuery.on("key_moved", function(username, userLocation) {
				// Get the user from the list of users in the query
				console.log('Moved:',username, userLocation)
				var user = usersInQuery[username];

				// Animate the user's marker
				if (typeof user !== "undefined" && typeof user.marker !== "undefined") {
				  //user.marker.animatedMoveTo(userLocation);
				  user.marker.setPosition(new google.maps.LatLng(userLocation[0], userLocation[1]));
				}
			});

			/* Removes user markers from the map when they exit the query */
			geoQuery.on("key_exited", function(username, userLocation) {
				console.log('Exit:',username, userLocation)
				// Get the user from the list of users in the query
				var user = usersInQuery[username];

				// If the user's data has already been loaded from the Open Data Set, remove its marker from the map
				if (user !== true) {
				  user.marker.setMap(null);
				}

				// // Remove the user from the list of users in the query
				delete usersInQuery[username];
			});

demo(cX, cY, geoFire);
    	});

    	$scope.map = map;
  	};

  	ionic.Platform.ready(initialize);
});

function demo(cX, cY, geoFire) {
	var locations = [
	    [cX + 0.001,cY],
	    [cX,cY + 0.001],
	    [cX - 0.001,cY],
	    [cX,cY - 0.001]
	  ];

	var promises = locations.map(function(location, index) {
	  return geoFire.set("user" + index, location).then(function() {
	    console.log("user" + index + " initially set to [" + location + "]");
	  });
	}); 

	// fxn to move a random user a random direction
	var moveRandom = function() {
	  var len = locations.length;
	  var randomUser = Math.floor(Math.random() * len);
	  var location = locations[randomUser];
	  var randomLatLon = Math.round(Math.random() * 1);
	  var randomDirection = Math.round(Math.random() * 1);
	  if (randomDirection === 0) {
	    location[randomLatLon] -= .0005;
	  } else {
	    location[randomLatLon] += .0005;
	  }
	  
	  return geoFire.set("user" + randomUser, location).then(function() {
	      console.log("user" + index + "  set to [" + location + "]");
	  });
	}  

	setInterval(moveRandom, 300);  	
};

google.maps.Marker.prototype.animatedMoveTo = function(newLocation) {
  	var toLat = newLocation[0];
	var toLng = newLocation[1];

	var fromLat = this.getPosition().lat();
	var fromLng = this.getPosition().lng();

  if (!coordinatesAreEquivalent(fromLat, toLat) || !coordinatesAreEquivalent(fromLng, toLng)) {
    var percent = 0;
    var latDistance = toLat - fromLat;
    var lngDistance = toLng - fromLng;
    var interval = window.setInterval(function () {
      percent += 0.01;
      var curLat = fromLat + (percent * latDistance);
      var curLng = fromLng + (percent * lngDistance);
      var pos = new google.maps.LatLng(curLat, curLng);
      this.setPosition(pos);
      if (percent >= 1) {
        window.clearInterval(interval);
      }
    }.bind(this), 50);
  }
};

/*
37.6297711
-122.42076659999998
*/

// var random = new google.maps.Marker({
//   position: new google.maps.LatLng(37.64, -122.42076659999998),
//   map: map,
//   title: 'random'
// });

// var locations = [
//     [37.64, -122.42076659999998],
//     [37.625, -122.42076659999998],
//     [37.635, -122.42076659999998],
//     [37.62, -122.42076659999998],
//   ];

// // ADDING DATA TO GEOFIRE
// var promises = locations.map(function(location, index) {
//   return geoFire.set("fish" + index, location).then(function() {
//     console.log("user" + index + " initially set to [" + location + "]");
//   });
// });

// QUERYING DATA FROM GEOFIRE
// geoFire.get(selectedFishKey).then(function(location) {
//   if (location === null) {
//     log( selectedFishKey + " is not in GeoFire");
//   }
//   else {
//     log(selectedFishKey + " is at location [" + location + "]");
//   }
// });

//move the marker      
//myLocation.setPosition(new google.maps.LatLng(currentLocation.A, currentLocation.F+0.003));