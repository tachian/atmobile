'use strict';

var googlePlusServices = angular.module('googlePlusServices', []);

googlePlusServices.factory('GooglePlus', ['$window', '$rootScope', '$http', 'API_SERVER', 'GOOGLE_APP_ID', 'GOOGLE_API_KEY', function ($window, $rootScope, $http, API_SERVER, GOOGLE_APP_ID, GOOGLE_API_KEY) {

  $window.render = function() {
    $window.gapi.client.setApiKey(GOOGLE_API_KEY);
    // console.log('GooglePlus Loaded');
  }

  $window.onGooglePlusLogin = function(authResult) {
    if (authResult && !authResult.error) {
      $window.gapi.client.setApiKey("");
      $window.gapi.client.load('oauth2', 'v2', function() {
        $window.gapi.client.oauth2.userinfo.get().execute(function (userinfo) {
          var user_data = {
            provider: 'googleplus',
            id: userinfo.id,
            email: userinfo.email
          };
          $rootScope.$emit('gp-social-provider-allowed', user_data);
        });
      });
    }
  }

  var service = {
    scopes: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/userinfo.email'],

    init: function() {
      window.___gcfg = {
        lang: 'pt-BR',
        parsetags: 'onload'
      };
      (function() {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/client:plusone.js?onload=render';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
      })();
    },

    authorize: function (){
      $window.gapi.auth.authorize({client_id: GOOGLE_APP_ID, scope: service.scopes, immediate: false}, service.onGooglePlusAuthorized);
    },

    //Execute on load profile 
    onGooglePlusAuthorized : function(authResult) {
      var config = {
        'clientid': GOOGLE_APP_ID,
        'cookiepolicy': 'single_host_origin',
        'callback': 'onGooglePlusLogin'
      };
      $window.gapi.auth.signIn(config);
    },
  };
  
  return service;
}]);
