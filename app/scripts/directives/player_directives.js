'use strict';

/* Directives */

angular.module('playerDirectives', [])
.directive('videojs', function ($interval) {
    return {
      restrict : 'A',
      link : function (scope, element, attrs){

          var time_player = {time: 0};

          if(angular.isObject(JSON.parse(window.localStorage.getItem('_tlp_player_' + scope.currentLecture.part.id)))) {
            time_player = JSON.parse(window.localStorage.getItem('_tlp_player_' + scope.currentLecture.part.id));
          }

          var setup = {
            'techOrder' : ['html5', 'youtube'],
            'aspectRatio': 'auto',
            'height': 'auto',
            'width': 'auto',
            'preload': 'auto',
            'controls': 'controls',
            'starttime': time_player.time,
            'volume':10
          };
          scope.player = videojs("videoPlayer", setup);
          
          scope.player.enableTouchActivity()
          scope.player.src([{src:"https://m.youtube.com/watch?v="+scope.currentLecture.part.url.trim(), type:'video/youtube'}]);
          scope.player.bigPlayButton.hide();

          if(scope.currentLecture.lecture.subtitle){
            scope.player.textTracks_[0].src_ = "http://tulupa.s3.amazonaws.com/subtitles/"+scope.currentLecture.lecture.subtitle+"?true"  
          }          

          angular.element('body').css('padding-top','0px');

          scope.player.load();

          scope.$on('$destroy', function(node, scope){
            videojs('videoPlayer').dispose();
            element.html('');
            angular.element('body').css('padding-top','50px');
            $interval.cancel(stopTime);
          });

          var stopTime = $interval(setTime, 5000);

          function setTime(){
            window.localStorage.setItem('_tlp_player_' + scope.currentLecture.part.id, JSON.stringify({
              time: parseInt(scope.player.currentTime())})
            );
          }
        }    
    };
});
