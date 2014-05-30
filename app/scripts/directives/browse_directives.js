'use strict';

/* Directives */

angular.module('browseDirectives', [])
.directive('mvCompleteCourse', function () {
    return {
      restrict : 'A',
   		link: function (scope, element, attrs){

   			function completeCourse(){
   				if(scope.course.percentComplete >= 100){
           	element.css('background-color', 'rgba(0, 255, 0, 0.15)');
         	}	
   			}
	          
   			scope.$watch('course.percentComplete', function(newVal, oldVal, scope) {
   				completeCourse();
				});

     	}    
 		};
})		
.directive('mvCompleteLecture', function () {
    return {
      restrict : 'A',
      link: function (scope, element, attrs){

        function completeLecture(){
          if(scope.lecture.perc >= 100){
            element.css('background-color', 'rgba(0, 255, 0, 0.15)');
          }
          if(scope.lecture.perc > 0 && scope.lecture.perc < 100){
            element.css('background-color', 'rgba(0, 163, 255, 0.15)');
          }
        }
            
        scope.$watch('lecture.perc', function(newVal, oldVal, scope) {
          completeLecture();
        });

      }    
    };
})
.directive('mvCompletePart', function () {
    return {
      restrict : 'A',
      link: function (scope, element, attrs){

        function completePart(){
          if(scope.lecture.currentPart.visited){
            element.css('color', 'rgb(68, 180, 87)');
          }
          else
          {
            element.css('color', 'black');
          }
        }
            
        scope.$watch('lecture.currentPart', function(newVal, oldVal, scope) {
          completePart();
        });

        scope.$watch('lecture.currentPart.visited', function(newVal, oldVal, scope) {
          completePart();
        });
      }    
    };
})