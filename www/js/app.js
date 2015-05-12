var fb = new Firebase("https://bump-app.firebaseio.com/");
var geoFire = new GeoFire(fb)

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

.controller('MapController', function($scope, $ionicLoading) {
  google.maps.event.addDomListener(window, 'load', function() {
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
      //var currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      var currentLocation = new google.maps.LatLng(37.6297711, -122.42076659999998);
      map.setCenter(currentLocation);

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

// ADDING DATA TO GEOFIRE
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
/*************/
/*  GEOQUERY */
/*************/
// Keep track of all of the vehicles currently within the query
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

/* Adds new vehicle markers to the map when they enter the query */
geoQuery.on("key_entered", function(vehicleId, vehicleLocation) {
  console.log('Entered:',vehicleId, vehicleLocation)
  // Specify that the vehicle has entered this query
  vehicleId = vehicleId.split(":")[1];
  vehiclesInQuery[vehicleId] = true;


  // Look up the vehicle's data in the Transit Open Data Set
  // transitFirebaseRef.child("sf-muni/vehicles").child(vehicleId).once("value", function(dataSnapshot) {
  //   // Get the vehicle data from the Open Data Set
  //   vehicle = dataSnapshot.val();

  //   // If the vehicle has not already exited this query in the time it took to look up its data in the Open Data
  //   // Set, add it to the map
  //   if (vehicle !== null && vehiclesInQuery[vehicleId] === true) {
  //     // Add the vehicle to the list of vehicles in the query
  //     vehiclesInQuery[vehicleId] = vehicle;

  //     // Create a new marker for the vehicle
  //     vehicle.marker = createVehicleMarker(vehicle, getVehicleColor(vehicle));
  //   }
  // });
});

/* Moves vehicles markers on the map when their location within the query changes */
geoQuery.on("key_moved", function(vehicleId, vehicleLocation) {
  // Get the vehicle from the list of vehicles in the query
  console.log('Moved:',vehicleId, vehicleLocation)
  vehicleId = vehicleId.split(":")[1];
  var vehicle = vehiclesInQuery[vehicleId];

  // Animate the vehicle's marker
  // if (typeof vehicle !== "undefined" && typeof vehicle.marker !== "undefined") {
  //   vehicle.marker.animatedMoveTo(vehicleLocation);
  // }
});

/* Removes vehicle markers from the map when they exit the query */
geoQuery.on("key_exited", function(vehicleId, vehicleLocation) {
  console.log('Exit:',vehicleId, vehicleLocation)
  // Get the vehicle from the list of vehicles in the query
  vehicleId = vehicleId.split(":")[1];
  var vehicle = vehiclesInQuery[vehicleId];

  // // If the vehicle's data has already been loaded from the Open Data Set, remove its marker from the map
  // if (vehicle !== true) {
  //   vehicle.marker.setMap(null);
  // }

  // // Remove the vehicle from the list of vehicles in the query
  // delete vehiclesInQuery[vehicleId];
});

    });

    $scope.map = map;
  });
});


// /* Logs to the page instead of the console */
//   function log(message) {
//     var childDiv = document.createElement("div");
//     var textNode = document.createTextNode(message);
//     childDiv.appendChild(textNode);
//     document.getElementById("log").appendChild(childDiv);
//   }
