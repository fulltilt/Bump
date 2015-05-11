// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
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
      var currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
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
    });

    $scope.map = map;
  });
});