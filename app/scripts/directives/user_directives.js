'use strict';

var userDirectives = angular.module('userDirectives', []);

// Login
userDirectives.directive('vdcLogin', ['$rootScope', '$route', '$location', function($rootScope, $route, $location) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:login-open', function (event, data) {
        $scope.login_form.$setPristine();
        if (angular.isDefined(data) && data.confirmation){
          $scope.confirmation_success = data.confirmation;
        }
        element.modal('show');
        element.removeClass('hide');
      });

      $rootScope.$on('event:login-close', function (event) {
        $scope.login_form.$setPristine();
        element.modal('hide');
      });

      $rootScope.$on('event:login-error', function (event, data) {
        if(data) {
          handleLoginErrorMessages(data.errors);
        } else {
          $scope.login_form.$setPristine();
        }
        element.modal('show');
      });

      function login_success(event) {
        $scope.showErrors = false;
        $scope.login_form.$setPristine();
        element.modal('hide');
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

      $rootScope.$on('event:login-success', function (event) { login_success(event); });

      $rootScope.$on('event:facebook-login-success', function (event) { login_success(event); });

      $rootScope.$on('event:confirmation_redirect_mba', function (event, data) { $location.path(data); });

      $scope.user_confirmed();

      angular.element('.close').bind('click', function (event) {
        $scope.showErrors = false;
        $scope.login_form.$setPristine();
        element.modal('hide');
        $scope.$apply();
      });
    }
  };
}]);

// Facebook Login
userDirectives.directive('vdcFacebookLogin', ['$rootScope', '$route', function ($rootScope, $route) {
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
userDirectives.directive('vdcSignup', ['$rootScope', '$analytics', function ($rootScope, $analytics) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $scope.errors = {};

      $rootScope.$on('event:signup-open', function (event, data) {
        $scope.errors = {};
        $scope.register_form.$setPristine();
        $scope.resetForm();
        element.modal('show');

        $analytics.eventTrack('start', { 
          category: 'user-action', label: 'signup'
        });
      });

      $rootScope.$on('event:signup-close', function (event, data) {
        $scope.errors = {};
        $scope.register_form.$setPristine();
        $scope.resetForm();
        element.modal('hide');

        $analytics.eventTrack('closed', { 
          category: 'user-action', label: 'signup'
        });
      });

      $rootScope.$on('event:signup-error', function (event, data) {
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
        element.modal('hide');
        // $scope.show_current_user();

        $analytics.eventTrack('finish', { 
          category: 'user-action', label: 'signup'
        });
      }

      $rootScope.$on('event:signup-success', function (event) { signup_success(event); });
      $rootScope.$on('event:facebook-login-success', function (event) { signup_success(event); });

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
userDirectives.directive('vdcSignupSuccess', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      var config = {skip_success: false};

      $rootScope.$on('event:signup-config', function (event, data) {
        config = data;
      });

      $rootScope.$on('event:signup-error', function (event) {
        element.modal('hide');
      });

      $rootScope.$on('event:signup-success', function (event, email) {
        if(!config.skip_success) {
          $scope.email = email;
          element.modal('show');
        } else {
          element.modal('hide');
        }
      });
    }
  };
}]);

// Forgot password
userDirectives.directive('vdcForgotPassword', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:password-recovery-error', function (event) {
        // $scope.resetForm();
        $scope.showErrors = true;
        element.modal('show');
        element.find('#error_message').removeClass('hidden')
      });

      $rootScope.$on('event:password-recovery-success', function (event) {
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
userDirectives.directive('vdcForgotPasswordSuccess', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:password-recovery-error', function (event) {
        element.modal('hide');
      });

      $rootScope.$on('event:password-recovery-success', function (event) {
        element.modal('show');
      });
    }
  };
}]);

// Resend confirmation mail
userDirectives.directive('vdcResendConfirmation', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:resend-confirmation-error', function (event) {
        $scope.resetForm();
        $scope.showErrors = true;
        element.modal('show');
        element.find('#error_message').show();
      });

      $rootScope.$on('event:resend-confirmation-success', function (event) {
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
userDirectives.directive('vdcResendConfirmationSuccess', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:resend-confirmation-error', function (event) {
        element.modal('hide');
      });

      $rootScope.$on('event:resend-confirmation-success', function (event) {
        element.modal('show');
      });
    }
  };
}]);

// Logout
userDirectives.directive('vdcLogout', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:logout-error', function (event) {
        $scope.showErrors = true;
      });

      $rootScope.$on('event:logout-success', function (event) {
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

userDirectives.directive('vdcProfileMenu', ['$cookieStore', '$rootScope', function ($cookieStore, $rootScope) {
  return {
    restrict: 'E',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:fetch-user-success', function (event) {});
    }
  };
}]);

userDirectives.directive('vdcResetPassword', ['$rootScope', '$location', function ($rootScope, $location) {
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      $rootScope.$on('event:reset-password', function (event, reset_password_token) {
        $scope.showErrors = false;
        $scope.reset_form.$setPristine();
        $scope.user.reset_password_token = reset_password_token;
        element.modal('show');
      });

      $rootScope.$on('event:password-set-success', function (event) {
        $scope.showErrors = false;
        element.modal('hide');
        $location.path('/');
      });

      $rootScope.$on('event:password-set-error', function (event) {
        $scope.showErrors = true;
        element.modal('show');
      });
    }
  };
}]);
