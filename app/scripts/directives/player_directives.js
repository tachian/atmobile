'use strict';

/* Directives */

angular.module('playerDirectives', [])
.directive('videojs', function ($interval) {
    return {
      restrict : 'A',
      link : function (scope, element, attrs){

          var setup = {
            'techOrder' : ['html5', 'youtube'],
            'aspectRatio': 'auto',
            'height': 'auto',
            'width': 'auto',
            'preload': 'auto'
          };
          scope.player = videojs("videoPlayer", setup);
          
          scope.player.src([{src:"http://m.youtube.com/watch?v="+scope.currentLecture.part.url.trim(), type:'video/youtube'}]);
          scope.player.bigPlayButton.hide();
          if(scope.currentLecture.lecture.subtitle){
            scope.player.textTracks_[0].src_ = "http://tulupa.s3.amazonaws.com/subtitles/"+scope.currentLecture.lecture.subtitle+"?true"  
          }
          
          if(angular.isObject(JSON.parse(window.localStorage.getItem('_tlp_player_' + scope.currentLecture.part.id)))) {
            var time_player = JSON.parse(window.localStorage.getItem('_tlp_player_' + scope.currentLecture.part.id));
            scope.player.currentTime(time_player);
          }

          scope.player.load();

          angular.element('body').css('padding-top','0px');

          scope.$on('$destroy', function(node, scope){
            videojs('videoPlayer').dispose();
            element.html('');
            angular.element('body').css('padding-top','50px');
            $interval.cancel(stopTime);
          });

          var stopTime = $interval(setTime, 5000);

          function setTime(){
            window.localStorage.setItem('_tlp_player_' + scope.currentLecture.part.id, JSON.stringify({
              time: scope.player.currentTime()})
            );
          }
        }    
    };
});
