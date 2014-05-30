'use strict';

var linkedinServices = angular.module('linkedinServices', []);

linkedinServices.factory('LinkedIn', ['$window', '$rootScope', '$http', 'API_SERVER', 'LINKEDIN_APP_ID', function ($window, $rootScope, $http, API_SERVER, LINKEDIN_APP_ID) {

  var service = {

    init: function() {
      var IN = $window.IN || IN;
      IN.init({
        onLoad: service.onLinkedInLoad(),
        api_key: LINKEDIN_APP_ID,
        authorize: true
      });
    },

    authorize: function (){
      IN.UI.Authorize().place();
      IN.Event.on(IN, "auth", function() {
        service.onLinkedInLogin();
      });
    },

    //Execute
    onLinkedInLoad : function() {
      // console.log('LinkedIn Loaded');
    },

    //execute on login event
    onLinkedInLogin : function() {
      var user_request_info = ["id", "email-address"];
      IN.API.Profile("me").fields(user_request_info).result(function (result) {
        var user_data = {
          provider: 'linkedin',
          id: result.values[0].id,
          email: result.values[0].emailAddress
        };
        $rootScope.$emit('event:ln-social-provider-allowed', user_data);
      });
    }
  };
  
  return service;
}]);
