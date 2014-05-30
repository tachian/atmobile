'use strict';

var facebookServices = angular.module('facebookServices', []);

facebookServices.factory('Facebook', ['$window', '$rootScope', '$http', 'API_SERVER', 'FACEBOOK_APP_ID', function ($window, $rootScope, $http, API_SERVER, FACEBOOK_APP_ID) {

  var service = {
    init: function() {
      $window.fbAsyncInit = function() {
        var FB = $window.FB || FB;

        FB.init({
          appId: FACEBOOK_APP_ID,
          channelUrl: '/channel.html',
          status: true, // check login status
          cookie: true, // enable cookies to allow the server to access the session
          xfbml: true // parse XFBML
        });

        FB.Event.subscribe('auth.authResponseChange', function (response) {
          if (response.status === 'connected') {
            // User connected from facebook
            $rootScope.$emit('event:facebook-connected', response.authResponse);
          } else {
            // User not connected from facebook
            $rootScope.$emit('event:facebook-disconnected');
          }
        });
      };

      // Load Facebook SDK
      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s);
        js.id = id;
        js.src = '//connect.facebook.net/en_US/all.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    },

    login: function() {
      var FB = $window.FB || FB;
      var user_data = {};

      FB.login(function (response) {
        if (response.authResponse) {
          user_data.credentials = response.authResponse;

          // The person logged into your app
          FB.api('/me', function (response) {
            user_data.info = response;

            // Get user avatar from Facebook
            FB.api('/me/picture?redirect=1&type=large', function (response) {
              user_data.info.avatar = response.data.url;

              $http.post('http://' + API_SERVER + '/facebook/login', {user_data: user_data})
              .then(function (response) { // Success
                $rootScope.$emit('event:facebook-login-success', response);
              },
              function (response) { // Error
                $rootScope.$emit('event:facebook-login-error', response);
              });
            });
          });
        } else {
          // The person cancelled the login dialog
          $rootScope.$emit('event:facebook-login-error', response);
        }
      }, {scope: 'email, user_birthday, user_location'});
    },

    connect: function() {
      var FB = $window.FB || FB;
      var user_data = {};

      FB.login(function (response) {
        if (response.authResponse) {
          user_data.credentials = response.authResponse;

          // The person logged into your app
          FB.api('/me', function (response) {
            var user_data = {
              provider: 'facebook',
              id: response.id,
              email: response.email
            };
            $rootScope.$emit('event:fb-social-provider-allowed', user_data);
          });
        }
      }, {scope: 'email, user_birthday, user_location'});
    },

    getUserData: function(credentials) {
      var FB = $window.FB || FB;
      var user_data = {credentials: credentials};

      // The person logged into your app
      FB.api('/me', function (response) {
        user_data.info = response;

        // Get user avatar from Facebook
        FB.api('/me/picture?redirect=1&type=large', function (response) {
          user_data.info.avatar = response.data.url;

          $http.post('http://' + API_SERVER + '/facebook/login', {user_data: user_data})
          .then(function (response) { // Success
            $rootScope.$emit('event:facebook-fetch-user-success', response);
          },
          function (response) { // Error
            $rootScope.$emit('event:facebook-fetch-user-error', response);
          });
        });
      });
    }
  };
  
  return service;
}]);
