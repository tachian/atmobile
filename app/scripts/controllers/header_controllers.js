'use strict';

var headerControllers = angular.module('headerControllers', []);

headerControllers.controller('HeaderController', ['$rootScope', '$scope', 'Session', function ($rootScope, $scope, Session) {

  $scope.title = "Tulupa";

  $scope.current_user = function () { 
    return Session.currentUser; 
  };

  $scope.showErrors = false;

  $scope.user = $scope.current_user() || {};
  if(!angular.isDefined($scope.user.remember_me)) {
    $scope.user.remember_me = true;
  }

  $scope.signed_in = function () {
    return Session.isAuthenticated();
  };

  $scope.logout = function() {
    Session.logout();
  };

  $scope.openLogin = function() {
    $rootScope.$emit('login-open');
  };

  $scope.openSignUp = function() {
    $rootScope.$emit('signup-open');
  };

  $scope.userHasMbaEnrollment = function () {
    return Session.userHasEnrollment('mba_ei').enrolled;
  };

  $scope.userHasCertifiedMbaEnrollment = function () {
    return Session.userHasEnrollment('mba_ei').user_request_certified;
  };

  $scope.userHasPhone = function() {
    return Session.userHasField('phone');
  };

  $scope.showBackButton = function() {
    return ($rootScope.currentPath != "/myCourses" && 
            $rootScope.currentPath != "/subjects" && 
            $rootScope.currentPath != "/universities" &&
            $rootScope.currentPath != "/");
  }

}]);