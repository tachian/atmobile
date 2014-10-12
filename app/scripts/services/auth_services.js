'use strict';

var authServices = angular.module('authServices', ['authHelpers']);

authServices.factory('AuthCallbacks', ['$rootScope','httpBuffer', function($rootScope, httpBuffer) {
  return {
    /**
    * Call this function to indicate that authentication was successfull and trigger a
    * retry of all deferred requests.
    * @param data an optional argument to pass on to $broadcast which may be useful for
    * example if you need to pass through details of the user that was logged in
    */
    authConfirmed: function(data, configUpdater) {
      var updater = configUpdater || function(config) {return config;};
      $rootScope.$emit('auth-token-success', data);
      httpBuffer.retryAll(updater);
    },

    /**
    * Call this function to indicate that authentication should not proceed.
    * All deferred requests will be abandoned or rejected (if reason is provided).
    * @param data an optional argument to pass on to $emit.
    * @param reason if provided, the requests are rejected; abandoned otherwise.
    */
    authCancelled: function(data, reason) {
      httpBuffer.rejectAll(reason);
      $rootScope.$emit('auth-token-rejected', data);
    }
  };
}]);

authServices.config(['$httpProvider', function($httpProvider) {

  // Main API Version Header
  $httpProvider.defaults.headers.common.Accept = 'application/vnd.tlp+json; version=1';

  $httpProvider.interceptors.push(['$rootScope', '$q', '$injector', 'httpBuffer', 'TokenHandler', function($rootScope, $q, $injector, httpBuffer, tokenHandler) {
    return {
      request: function(config) {
        $rootScope.$emit('load-start');
        if(tokenHandler.get() && !config.ignoreAuthModule) {
          config.headers.Authorization = 'Bearer ' + tokenHandler.get();
        }
        return config || $q.when(config);
      },
      response: function(response) {
        // get $http via $injector because of circular dependency problem
        var $http = $http || $injector.get('$http');
        if ($http.pendingRequests.length < 1) {
          $rootScope.$emit('load-end');
        }
        return response || $q.when(response);
      },
      responseError: function(rejection) {
        var deferred = $q.defer();
        if (rejection.status === 401 && !rejection.config.ignoreAuthModule) {
          // filter invalid token errors
          if(rejection.data.provider === 'application/vnd.loosa') {
            tokenHandler.set(null);
            httpBuffer.append(rejection.config, deferred);
            $rootScope.$emit('auth-token-error', rejection);
            return deferred.promise;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }]);
}]);

var authHelpers = angular.module('authHelpers', []);

authHelpers.factory('httpBuffer', ['$injector', function ($injector) {
  // Holds all the requests, so they can be re-requested in future.
  var buffer = [];

  // Service initialized later because of circular dependency problem.
  var $http;

  function retryHttpRequest(config, deferred) {
    function successCallback(response) {
      deferred.resolve(response);
    }
    function errorCallback(response) {
      deferred.reject(response);
    }
    $http = $http || $injector.get('$http');
    $http(config).then(successCallback, errorCallback);
  }

  return {
    // Appends HTTP request configuration object with deferred response attached to buffer.
    append: function(config, deferred) {
      buffer.push({
        config: config,
        deferred: deferred
      });
    },

    // Abandon or reject (if reason provided) all the buffered requests.
    rejectAll: function(reason) {
      if (reason) {
        for (var i = 0; i < buffer.length; ++i) {
          buffer[i].deferred.reject(reason);
        }
      }
      buffer = [];
    },

    // Retries all the buffered requests clears the buffer.
    retryAll: function(updater) {
      for (var i = 0; i < buffer.length; ++i) {
        retryHttpRequest(updater(buffer[i].config), buffer[i].deferred);
      }
      buffer = [];
    }
  };
}]);

authHelpers.factory('TokenHandler', [function () {
// authHelpers.factory('TokenHandler', ['$cookieStore', function (cookies) {
  var tokenHandler = {};
  var token = false;

  tokenHandler.set = function(newToken) {
    token = newToken;
    // cookies.put('_tlp_scratchy_token', token);
  };

  tokenHandler.get = function() {
    return token;
  };

  return tokenHandler;
}]);
