var app = angular.module('bump', ['ionic', 'firebase'])
  .constant('FURL', 'https://bump-app.firebaseio.com/')  

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
        .state("register", {
            url: "/register",
            templateUrl: "templates/register.html",
            controller: "AuthController"
        })
        .state("forgot-password", {
            url: "/forgot-password",
            templateUrl: "templates/forgot-password.html",
            controller: "AuthController"
        })
        .state("login", {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: "AuthController"
        })    
        .state('home', {
            url: "/home",
            templateUrl: "templates/home.html",
            controller: "MapController",
            resolve: {
              currentAuth: function(Auth) {
                return Auth.requireAuth();
              }
            }       
        })
        .state("profile", {
            url: "/profile",
            templateUrl: "templates/profile.html",
            controller: "MapController",
            resolve: {
              currentAuth: function(Auth) {
                return Auth.requireAuth();
              }
            }
        }) 
        .state("otherwise", {
            url: "*path",
            templateUrl: "templates/login.html",
            controller: "AuthController"
        });       
        // .state("otherwise", {
        //     url: "*path",
        //     templateUrl: "templates/home.html",
        //     controller: "MapController"
        // });
});