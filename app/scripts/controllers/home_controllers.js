'use strict';

var homeControllers = angular.module('homeControllers', []);

homeControllers.controller('HomeController', ['$scope', '$rootScope', '$location', 'Session',
  function ($scope, $rootScope, $location, Session) {

    if(Session.isAuthenticated()) {
      $location.path('/myCourses');
    }

    $scope.signed_in = function () {
      return Session.isAuthenticated();
    };

    $scope.openSignUp = function() {
      $rootScope.$emit('signup-open');
    };

    $scope.openLogin = function() {
  	  $rootScope.$emit('login-open');
  	};
  }
]);