'use strict';

var trackingServices = angular.module('trackingServices', ['angulartics', 'angulartics.google.analytics']);

trackingServices.config(['$analyticsProvider', 'GOOGLE_ANALYTICS_ID', function ($analyticsProvider, GOOGLE_ANALYTICS_ID) {
  // Configure Angulartics Google Analytics provider
  $analyticsProvider.settings.pageTracking.autoTrackFirstPage = false;

  // Configure Google Analytics
  window._gaq = window._gaq || [];
  window._gaq.push(['_setAccount', GOOGLE_ANALYTICS_ID]);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
}]);
