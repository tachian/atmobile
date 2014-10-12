'use strict';

var signupServices = angular.module('signupServices', ['ngResource']);

signupServices.factory('SignupSteps', ['$routeParams', '$rootScope', '$location', '$analytics', 'Session', 'ab', function ($routeParams, $rootScope, $location, $analytics, Session, ab) {

  var routeStep = $routeParams.step;
  var steps = [1, 2, 3, 4, 5];

  var templates_a = {a:["signup_1.html", "signup_2.html", "signup_3.html", "signup_4.html", "signup_5.html"]};
  var templates_b = {b:["signup_1.html", "signup_3.html", "signup_2.html", "signup_4.html", "signup_5.html"]};

  var templates_test = ab.test([templates_a, templates_b], 1);
  var version = templates_test['a'] ? 'a' : 'b';
  
  var templates = templates_test[version];

  // Analytics
  $analytics.eventTrack('abtest', {
    category: 'user-action', label: 'version-' + version
  });

  var service = {
    steps: steps,
    templates: templates,
    currentStep: (routeStep - 1),
    version: version
  };

  service.getVersion = function(){
    return service.version;
  }

  service.fromRoute = function() {
    var routeStep = parseInt($routeParams.step);
    // check for a invalid step from route
    if(!routeStep || isNaN(routeStep) || routeStep > steps.length) {
      routeStep = 1;
    }

    // check for a valid step from route
    if(routeStep && !isNaN(routeStep) && routeStep <= steps.length) {
      service.setCurrentStep(routeStep - 1);
    }
  };

  service.skipStep = function() {
    if(service.currentStep < (service.steps.length - 1)) {
      service.currentStep++;
    }

    $analytics.eventTrack('signup-skip', {
      category: 'user-action', label: 'step-' + service.currentStep + '-' + version
    });

    $rootScope.$emit('signup-step-changed');
    $rootScope.$emit('signup-step-skipped');
    $location.path('/signup/' + (service.currentStep + 1));
  };

  service.getCurrentStep = function() {
    return service.currentStep;
  };

  service.setCurrentStep = function(step) {
    service.currentStep = step;

    $rootScope.$emit('signup-step-changed');
    $location.path('/signup/' + (service.currentStep + 1));
  };

  service.getCurrentTemplate = function() {
    return "views/signup/" + service.templates[service.currentStep];
  };

  service.checkUserSession = function() {
    if(!Session.isAuthenticated()) {
      $location.path('/');
    }
  };

  return service;
}]);

signupServices.factory('SignupData', ['$rootScope', '$location', '$http', 'Session', 'NewProfile', function ($rootScope, $location, $http, Session, NewProfile) {
  // Set auth headers
  if(Session.isAuthenticated()) {
    $http.defaults.headers.common['X-User-Token'] = Session.currentUser.authentication_token;
    $http.defaults.headers.common['X-User-Email'] = Session.currentUser.email;
  }

  var service = {
    data: {}
  };

  service.populate = function(field, value) {
    service.data[field] = value;
  };

  service.read = function(field) {
    return service.data[field];
  };

  service.edit = function () {
    return NewProfile.edit().$promise
  };
  
  service.update = function (data) {
    return NewProfile.update({profile: data}).$promise
  };

  return service;
}]);