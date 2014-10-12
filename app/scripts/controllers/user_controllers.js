'use strict';

var userControllers = angular.module('userControllers', []);

userControllers.controller('UserController', ['$scope', '$routeParams', 'Session',function ($scope, $routeParams, Session, $sessionStorage) {

  $scope.current_user = function () {
   return Session.currentUser; 
  };

  $scope.showErrors = false;

  $scope.user = $scope.current_user() || {};
  if(!angular.isDefined($scope.user.remember_me)) {
    $scope.user.remember_me = true;
  }

  if(angular.isDefined($routeParams.reset_passoword_token)) {
    $scope.user.reset_password_token = $routeParams.reset_passoword_token;
    $scope.$emit('reset-password', $routeParams.reset_passoword_token);
  }

  $scope.signed_in = function () {
    return Session.isAuthenticated();
  };


  $scope.user_confirmed = function () {
    if(!$scope.signed_in()) {
      return Session.userConfirmed();
    }
    return false;
  };


  $scope.register = function() {
    $scope.showErrors = false;

    var area_code = null;
    var phone_number = null;
    var phone = '';

    if($scope.user.area_code) {
      area_code = $scope.user.area_code.replace(/[^0-9]+/g, '');
    }

    if($scope.user.phone_number) {
      phone_number = $scope.user.phone_number.replace(/[^0-9]+/g, '');
    }

    if(area_code) {
      phone += '(' + area_code + ')';
    }

    if(phone_number) {
      phone += phone_number;
    }

    $scope.user.phone = phone;
    Session.register($scope.user.name, $scope.user.email, $scope.user.phone, $scope.user.password);
  };

  $scope.login = function() {
    $scope.showErrors = false;
    Session.login($scope.user.email, $scope.user.password, $scope.user.remember_me);
  };

  $scope.fbLogin = function() {
    Session.fbLogin();
  };

  $scope.recoverPassword = function() {
    Session.recover($scope.user.email);
  };

  $scope.resetPassword = function() {
    Session.resetPassword($scope.user.reset_password_token, $scope.user.password, $scope.user.password_confirmation);
  };

  $scope.resendConfirmation = function() {
    Session.resendConfirmation($scope.user.email);
  };

  $scope.logout = function() {
    Session.logout();
  };

  // Get current user
  $scope.show_current_user = function() {
    Session.getCurrentUser();
  };

  $scope.resetForm = function() {
    $scope.showErrors = false;
    $scope.user = {
      name: '',
      email: '',
      password: '',
      phone: '',
      remember_me: true
    };
  };

  $scope.formatAreaCode = function(value) {
    if(angular.isDefined(value)) {
      $scope.user.area_code = value.replace(/[^0-9]+/g, '');
    }
  };

  $scope.formatPhoneNumber = function(value) {
    if(angular.isDefined(value)) {
      $scope.user.phone_number = value.replace(/[^0-9]+/g, '');
    }
  };

  $scope.fromLoginToSignup = function() {
    $scope.$emit('login-close');
    $scope.$emit('signup-open');
  };

}]);

userControllers.controller('PasswordController', ['$scope', '$rootScope', 'Session', function ($scope, $rootScope, Session) {
  $scope.sendRecoverPassword = function(recoverData){
    Session.setPassword(recoverData);
  };
}]);
