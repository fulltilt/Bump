'use strict';

app.controller('ProfileController', function($scope, $state, FURL, Auth, mapService) {
	var fb = new Firebase(FURL);
	$scope.currentUser = Auth.user;

	$scope.email = atob($scope.currentUser.profile.email);

  	$scope.logout = function() {
  		Auth.logout();
		var intervalId = mapService.getIntervalId(),
			geoQuery = mapService.getGeoQuery(),
			bumpQuery = mapService.getBumpQuery();

		clearInterval(intervalId);
  		geoQuery.cancel();
  		bumpQuery.cancel();
  		$state.go('login');
  	}
});