'use strict';

var helperDirectives = angular.module('helperDirectives', []);

helperDirectives.directive('vdcModalHelper', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {

      function getCurrentModal() {
        var modals = angular.element('.modal');
        var current_modal = false;

        for(var i = 0; i < modals.length; i++) {
          if(angular.element(modals[i]).data('bs.modal')) {
            if(angular.element(modals[i]).data('bs.modal').isShown) {
              current_modal = angular.element(modals[i]);
              break;
            }
          }
        }

        return current_modal;
      }

      function hideCurrentModal() {
        var current_modal = getCurrentModal();

        if(current_modal) {
          current_modal.modal('hide');
          if(current_modal.find('iframe').length > 0) {
            current_modal.find('iframe').attr('src', current_modal.find('iframe').attr('src'));
          }
        }
      }

      // angular.element('body').keydown(function (event) {
      //   if (event.which === 27) {
      //     hideCurrentModal();
      //   }
      // }).on('mousemove', function (event) {
      //   angular.element('.modal-backdrop.in').on('click', function (event) {
      //     angular.element('.modal-backdrop.in').off('click');
      //     hideCurrentModal();
      //   });
      // });

      $scope.$on('event:close-all-modals', function(){
        hideCurrentModal();
        angular.element('.modal-backdrop.in').hide();
      });

    }
  };
}]);
