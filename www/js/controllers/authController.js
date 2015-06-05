'use strict';

app.controller("AuthController", function($scope, FURL, Auth, $state, $ionicHistory, $firebaseAuth) {
    // if user is logged in and tries to go into the login screen, redirect him to home
    if (Auth.signedIn()) {
        $state.go('main');
    }

    $scope.login = function(user) {
        Auth.login(user)
            .then(function() {
                $state.go('main');
            }, function(err) {
                console.log(err);
            });
    };

    $scope.register = function(user) {
        Auth.register(user)
            .then(function() {
                $state.go('main');
            }, function(err) {
                console.log(err);
            });
    };

    $scope.changePassword = function(user) {
        Auth.changePassword(user)
            .then(function() {
                // Reset form
                // $scope.user.email = '';
                // $scope.user.oldPassword = '';
                // $scope.user.newPassword = '';

                console.log('Password changed successfully!');
                $state.go("login");
            }, function(err) {
                console.log(err)
            });
    };

    $scope.requireAuth = function() {
      return Auth.$requireAuth();
    }

    // http://forum.ionicframework.com/t/back-button-not-showing-when-coming-from-nested-pages-tabs/18019/7
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
    });
});