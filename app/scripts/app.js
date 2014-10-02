'use strict';

var atmobileApp = angular.module('atmobileApp', [
  'appConfig',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'browseServices',
  'sessionServices',
  'facebookServices',
  'googlePlusServices',
  'linkedinServices',
  'twitterServices',
  'signupServices',
  'trackingServices',
  'authServices',
  'browseControllers',
  'homeControllers',
  'userControllers',
  'headerControllers',
  'playerDirectives',
  'helperDirectives',
  'userDirectives',
  'browseDirectives'
]);

atmobileApp.config(['$routeProvider', '$locationProvider', '$provide',
  function($routeProvider, $locationProvider, $provide) {
    $routeProvider.
      when('/subjects', {
        templateUrl: 'views/browse/subjects.html',
        controller: 'SubjectsController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      when('/subject/:id', {
        templateUrl: 'views/browse/courses.html',
        controller: 'SubjectController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          service: ['ServiceName', function (ServiceName) {
            return ServiceName.load('courses');
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      when('/universities', {
        templateUrl: 'views/browse/universities.html',
        controller: 'UniversitiesController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      when('/university/:id', {
        templateUrl: 'views/browse/courses.html',
        controller: 'UniversityController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          service: ['ServiceName', function (ServiceName) {
            return ServiceName.load('courses');
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      when('/myCourses', {
        templateUrl: 'views/browse/my_courses.html',
        controller: 'MyCoursesController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      when('/mba', {
        templateUrl: 'views/browse/mba.html',
        controller: 'MbaController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      when('/course/:id', {
        templateUrl: 'views/browse/lectures.html',
        controller: 'LecturesController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      when('/', {
        templateUrl: 'views/home/index.html',
        controller: 'HomeController',
        resolve: {
          getSession: ['Session', function (Session) {
            return Session.getCurrentUser();
          }],
          layout: [function () {
            return {
              header: 'views/header/index.html'
            };
          }]
        }
      }).
      otherwise({
        redirectTo: '/'
      });

    // Creates helper $onRootScope method
    $provide.decorator('$rootScope', ['$delegate', function($delegate) {

      Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
        value: function(name, listener){
          var unsubscribe = $delegate.$on(name, listener);
          this.$on('$destroy', unsubscribe);
        },
        enumerable: false
      });
      return $delegate;
    }]);

  }]);


atmobileApp.run(['$rootScope', '$location', '$http', 'TokenHandler', 'AuthCallbacks', 'MetaData', 'Facebook', 'Session', function ($rootScope, $location, $http, TokenHandler, AuthCallbacks, MetaData, Facebook, Session) {

  // Initialize authorization token
  if(!TokenHandler.get()) {
    $http.post('/oauth/authorize', {}, {ignoreAuthModule: true}).success(
      function (data) {
        TokenHandler.set(data.access_token);
        AuthCallbacks.authConfirmed();
      }
    ).error(
      function (data) {
        TokenHandler.set(false);
        AuthCallbacks.authCancelled(data.error);
      }
    );
  } else {
    authCallbacks.authConfirmed();
  }

  // Get a token from API if client not authorized
  $rootScope.$on('event:auth-token-error',
    function (event, rejection) {
      if(!TokenHandler.get()) {
        $http.post('/oauth/authorize', {}, {ignoreAuthModule: true}).success(
          function (data) {
            TokenHandler.set(data.access_token);
            AuthCallbacks.authConfirmed();
          }
        ).error(
          function (data) {
            TokenHandler.set(false);
            AuthCallbacks.authCancelled(data.error);
          }
        );
      } else {
        AuthCallbacks.authConfirmed();
      }
    }
  );

  // Initialize metadata
  $rootScope.metadata = {
    'mainTitle': 'Loopa - O melhor conteúdo ao seu alcance.',
    'title': 'Loopa',
    'description': 'O melhor conteúdo ao seu alcance.',
    'og:url': 'http://www.loopa.com.br',
    'og:description': 'O melhor conteúdo ao seu alcance.',
    'og:title': 'Loosa',
    'og:image': ''
  };

  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    $rootScope.layout = current.locals.layout;
    $rootScope.metadata = MetaData.read();
    $rootScope.currentPath = $location.path();
  });

  // Initialize Facebook SDK
  Facebook.init();
}]);


atmobileApp.factory('ServiceName', ['$q', function ($q) {
  return {
    name: '',
    load : function(serviceName) {
      this.name = serviceName;
      return this.name || $q.when(this.name);
    }
  };
}]);

atmobileApp.factory('MetaData', ['$q', function ($q) {
  return {
    metadata: {
      'mainTitle': 'Loosa - O melhor conteúdo ao seu alcance.',
      'title': 'Loopa',
      'description': 'O melhor conteúdo ao seu alcance.',
      'og:url': 'http://www.loopa.com.br',
      'og:description': 'O melhor conteúdo ao seu alcance.',
      'og:title': 'Loosa',
      'og:type': 'website',
      'og:image': ''
    },
    load: function(metadata) {
      this.metadata = metadata || this.metadata; // Defaults to main metadata object;
      return this.metadata || $q.when(this.metadata);
    },
    read: function() {
      return this.metadata || $q.when(this.metadata);
    }
  };
}]);