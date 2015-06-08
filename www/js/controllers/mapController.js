'use strict';

app.controller('MapController', function($scope, FURL, mapService, $state) {
	$scope.map = mapService.map;

  	$scope.goProfile = function() {
  		$state.go('profile');
  	}
});

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