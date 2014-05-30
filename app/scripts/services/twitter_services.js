'use strict';

var twitterServices = angular.module('twitterServices', []);

twitterServices.factory('Twitter', ['$window', '$rootScope', '$http', 'API_SERVER', 'TWITTER_APP_ID', function ($window, $rootScope, $http, API_SERVER, TWITTER_APP_ID) {

  var bearerToken = function(){
    var consumerKey = encodeURIComponent(TWITTER_APP_ID);
    var consumerSecret = encodeURIComponent('3wjCvlCrY8867hS0OC4k9tOrvnurD6ynhY9e2hXNtispYm5YQ9');
    var tokenCredentials = btoa(consumerKey + ':' + consumerSecret);

    return tokenCredentials;
  };

  var service = {
    baseUrl: 'https://api.twitter.com/',

    authorize: function (){
      var oAuthurl = service.baseUrl + "oauth2/token";
      var headers = {
        'Authorization': 'Basic ' + bearerToken(),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      };
      $http.defaults.useXDomain = true;
      $http({
        method: 'POST', 
        url: oAuthurl, 
        headers: headers, 
        data: 'grant_type=client_credentials'
      }).success(function (data, status){
        console.log(data);
      }).
      error(function (data, status){
        console.log(data);
      });
    },

    //execute on login event
    onLinkedInLogin : function() {
      
    }
  };
  
  return service;
}]);
