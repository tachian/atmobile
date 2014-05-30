'use strict';

/* Directives */

angular.module('playerDirectives', [])
.directive('videojs', function () {
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
            scope.player.textTracks_[0].src_ = "http://assets.veduca.com.br/uploads/subtitle/"+scope.currentLecture.lecture.subtitle+"?true"  
          }
          
          scope.player.load();

          angular.element('body').css('padding-top','0px');  

          scope.$on('$destroy', function(node){
            videojs('videoPlayer').dispose();
            element.html('');
            angular.element('body').css('padding-top','50px');
          });
        }    
    };
});
