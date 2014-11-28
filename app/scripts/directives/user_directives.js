'use strict';

var userDirectives = angular.module('userDirectives', []);

// Login
userDirectives.directive('tlpLogin', ['$rootScope', '$route', '$location', function($rootScope, $route, $location) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $scope.login_form.$setPristine();

      $rootScope.$on('login-close', function (event) {
        $scope.login_form.$setPristine();
      });

      $rootScope.$on('login-error', function (event, data) {
        if(data) {
          handleLoginErrorMessages(data.errors);
        } else {
          $scope.login_form.$setPristine();
        }
      });

      function login_success(event) {
        $scope.showErrors = false;
        $scope.login_form.$setPristine();
        element.addClass('hide');
        $scope.show_current_user();
        $location.path('/myCourses');
      }

      function handleLoginErrorMessages(errors) {
        $scope.errors = errors;

        if (errors.type === 'unconfirmed'){
          $scope.errors.unconfirmed = true;
        }
        $scope.showErrors = true;
      };

      $rootScope.$on('login-success', function (event) {
        login_success(event);
        if($rootScope.$$listeners['login-success'].length > 1){
          $rootScope.$$listeners['login-success'].pop(1);
        }
      });

      $rootScope.$on('facebook-login-success', function (event) {
        login_success(event);
        if($rootScope.$$listeners['facebook-login-success'].length > 1){
          $rootScope.$$listeners['facebook-login-success'].pop(1);
        }
      });

      $rootScope.$on('confirmation_redirect_mba', function (event, data) {
        $location.path(data); 
      });

      $scope.user_confirmed();

    }
  };
}]);

// Facebook Login
userDirectives.directive('tlpFacebookLogin', ['$rootScope', '$route', function ($rootScope, $route) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      angular.element(element).bind('click', function (event) {
        $scope.fbLogin();
      });
    }
  };
}]);

// Sign up
userDirectives.directive('tlpSignup', ['$rootScope', '$analytics', '$location', function ($rootScope, $analytics, $location) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $scope.errors = {};

      $rootScope.$on('signup-open', function (event, data) {
        $scope.errors = {};
        $scope.register_form.$setPristine();
        $scope.resetForm();
        element.modal('show');

        $analytics.eventTrack('start', { 
          category: 'user-action', label: 'signup'
        });
      });

      $rootScope.$on('signup-close', function (event, data) {
        $scope.errors = {};
        $scope.register_form.$setPristine();
        $scope.resetForm();
        element.modal('hide');

        $analytics.eventTrack('closed', { 
          category: 'user-action', label: 'signup'
        });
      });

      $rootScope.$on('signup-error', function (event, data) {
        angular.forEach(data.errors, function (value, key) {
          $scope.errors[key] = key + ' ' + value[0];
        });
        $scope.register_form.$setPristine();
        element.modal('show');

        $analytics.eventTrack('error', { 
          category: 'user-action', label: 'signup'
        });
      });

      function signup_success(event) {
        $scope.showErrors = false;
        $scope.register_form.$setPristine();
        element.addClass('hide');
        $scope.show_current_user();

        $analytics.eventTrack('finish', { 
          category: 'user-action', label: 'signup'
        });

        //TODO: Ver alternativa para remover modal-backdrop. Isso ocorre por causa do location.path. 
        //Está trocando de página numa chamada assincrona sem fechar a modal.
        $('.modal-backdrop').remove();
        $location.path('/myCourses');
      }

      $rootScope.$on('signup-success', function (event) {
         signup_success(event); 
      });
      $rootScope.$on('facebook-login-success', function (event) { signup_success(event); });

      angular.element('.close').bind('click', function (event) {
        $scope.showErrors = false;
        $scope.register_form.$setPristine();
        element.modal('hide');
        $scope.$apply();

        $analytics.eventTrack('closed', { 
          category: 'user-action', label: 'signup'
        });
      });
    }
  };
}]);

// SIgn up success
userDirectives.directive('tlpSignupSuccess', ['$rootScope', '$location', function ($rootScope, $location) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      var config = {skip_success: true};

      $rootScope.$on('signup-config', function (event, data) {
        config = data;
      });

      $rootScope.$on('signup-error', function (event) {
        element.modal('hide');
      });

      $rootScope.$on('signup-success', function (event, email) {
        if(!config.skip_success) {
          $scope.email = email;
          element.modal('show');
        }
      });
    }
  };
}]);

// Forgot password
userDirectives.directive('tlpForgotPassword', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('password-recovery-error', function (event) {
        $scope.resetForm();
        $scope.showErrors = true;
        element.modal('show');
        element.find('#error_message').removeClass('hidden')
      });

      $rootScope.$on('password-recovery-success', function (event) {
        $scope.showErrors = false;
        $scope.resetForm();
        $scope.forgot_form.$setPristine();
        element.find('#error_message').addClass('hidden')
        element.modal('hide');
        $scope.user = '';
        $scope.show_current_user();
      });
    }
  };
}]);

// Forgot password success
userDirectives.directive('tlpForgotPasswordSuccess', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('password-recovery-error', function (event) {
        element.modal('hide');
      });

      $rootScope.$on('password-recovery-success', function (event) {
        element.modal('show');
      });
    }
  };
}]);

// Resend confirmation mail
userDirectives.directive('tlpResendConfirmation', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('resend-confirmation-error', function (event) {
        $scope.resetForm();
        $scope.showErrors = true;
        element.modal('show');
        element.find('#error_message').show();
      });

      $rootScope.$on('resend-confirmation-success', function (event) {
        $scope.showErrors = false;
        $scope.resend_confirmation.$setPristine();
        element.find('#error_message').hide();
        element.modal('hide');
        $scope.user = '';
      });
    }
  };
}]);

// Resend confirmation mail success
userDirectives.directive('tlpResendConfirmationSuccess', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('resend-confirmation-error', function (event) {
        element.modal('hide');
      });

      $rootScope.$on('resend-confirmation-success', function (event) {
        element.modal('show');
      });
    }
  };
}]);

// Logout
userDirectives.directive('tlpLogout', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('logout-error', function (event) {
        $scope.showErrors = true;
      });

      $rootScope.$on('logout-success', function (event) {
        $scope.showErrors = false;
      });

      var button = angular.element(element);
      button.bind('click', function() {
        $scope.showErrors = false;
        $scope.logout();
      });
    }
  };
}]);

userDirectives.directive('tlpProfileMenu', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'E',
    link: function($scope, element, attrs) {
      $rootScope.$on('fetch-user-success', function (event) {});
    }
  };
}]);

userDirectives.directive('tlpResetPassword', ['$rootScope', '$location', function ($rootScope, $location) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('reset-password', function (event, reset_password_token) {
        $scope.showErrors = false;
        $scope.reset_form.$setPristine();
        $scope.user.reset_password_token = reset_password_token;
        element.modal('show');
      });

      $rootScope.$on('password-set-success', function (event) {
        $scope.showErrors = false;
        element.modal('hide');
        $location.path('/');
      });

      $rootScope.$on('password-set-error', function (event) {
        $scope.showErrors = true;
        element.modal('show');
      });
    }
  };
}]);
