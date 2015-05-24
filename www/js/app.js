var fb = new Firebase("https://bump-app.firebaseio.com/");
var geoFire = new GeoFire(fb.child('users'));

angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('tabs', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html"
        })
        .state('tabs.home', {
          url: "/home",
          views: {
            'home-tab': {
              templateUrl: "templates/home.html",
              controller: "MapController"
            }
          }
        })
        .state("home", {
            url: "/",
            templateUrl: "templates/home.html",
            controller: "MapController",
            cache: false
        })
        .state("firebase", {
            url: "/firebase",
            templateUrl: "templates/firebase.html",
            controller: "FirebaseController"
        });
    
    $urlRouterProvider.otherwise('/tab/home');
})
    
.controller('MapController', function($scope, $ionicLoading) {
  function initialize() {
    var SFMarket = [37.785326, -122.405696]
    var myLatlng = new google.maps.LatLng(SFMarket[0], SFMarket[1]);

    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Get users current location
    navigator.geolocation.getCurrentPosition(function (pos) {
      var currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map.setCenter(currentLocation);
var cX = currentLocation.A,
cY = currentLocation.F;
      // Create a draggable circle centered on the map
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

      var myLocation = new google.maps.Marker({
        position: currentLocation,
        map: map,
        title: 'My Location'
      });

      /*************/
      /*  GEOQUERY */
      /*************/
      // Keep track of all of the users currently within the query
      var usersInQuery = {};

      // Create a new GeoQuery instance
      var geoQuery = geoFire.query({
        center: [currentLocation.A, currentLocation.F],
        radius: radiusInKm
      });

      //Update the query's criteria every time the circle is dragged
      var updateCriteria = _.debounce(function() {
        var latLng = circle.getCenter();
        geoQuery.updateCriteria({
          center: [latLng.lat(), latLng.lng()],
          radius: radiusInKm
        });
      }, 10);
      google.maps.event.addListener(circle, "drag", updateCriteria);

      /* Adds new user markers to the map when they enter the query */
      geoQuery.on("key_entered", function(username, userLocation) {
        console.log('Entered:',username, userLocation)
        // Specify that the user has entered this query
        usersInQuery[username] = true;

        // Look up the user's data in the data set
        fb.child("users").child(username).once("value", function(dataSnapshot) {
          // Get the user data from Firebase
          user = dataSnapshot.val();

          // If the user has not already exited this query in the time it took to look up its data in the firebase, add it to the map
          if (user !== null && usersInQuery[username] === true) {
            // Add the user to the list of users in the query
            usersInQuery[username] = user;

            // Create a new marker for the user
            user.marker = new google.maps.Marker({
                position: new google.maps.LatLng(userLocation[0], userLocation[1]),
                map: map,
                optimized: true,
                title: 'Hello World!'
            });
          }
        });    
      });

      /* Moves users markers on the map when their location within the query changes */
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

/*** START DEMO CODE ***/      
// test user locations
var locations = [
    [cX + 0.003,cY],
    [cX,cY + 0.003],
    [cX - 0.003,cY],
    [cX,cY - 0.003]
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

setInterval(moveRandom, 200);     
/*** /END DEMO CODE ***/    

    });

    $scope.map = map;
  };

/*
// test user locations
var locations = [
    [37.64, -122.42076659999998],
    [37.625, -122.42076659999998],
    [37.635, -122.42076659999998],
    [37.62, -122.42076659999998]
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

setInterval(moveRandom, 200);
*/
  ionic.Platform.ready(initialize);
});

/* Returns true if the two inputted coordinates are approximately equivalent */
function coordinatesAreEquivalent(coord1, coord2) {
  return (Math.abs(coord1 - coord2) < 0.000001);
}

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