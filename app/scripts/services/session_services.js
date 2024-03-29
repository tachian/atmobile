'use strict';

var sessionServices = angular.module('sessionServices', []);

sessionServices.factory('Session', ['$location', '$http', '$q' ,'$rootScope', 'Facebook', 'LinkedIn', 'GooglePlus', 'Twitter', 'API_SERVER', function ($location, $http, $q, $rootScope, Facebook, LinkedIn, GooglePlus, Twitter, API_SERVER) {
  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Try to get user from facebook if user connected
  $rootScope.$on('facebook-connected', function (event, credentials) {
    // if (!service.isAuthenticated()) {
    //   Facebook.getUserData(credentials);
    // }
    event.stopPropagation();
  });

  // Try to get user from facebook if user connected
  $rootScope.$on('facebook-login-success', function (event, data) {
    if (!service.isAuthenticated()) {
      service.populateUserFromFacebook(data);
    }
    event.stopPropagation();
  });

  // Try to get user from facebook after login
  $rootScope.$on('facebook-fetch-user-success', function (event, data) {
    if (!service.isAuthenticated()) {
      service.populateUserFromFacebook(data);
    }
    event.stopPropagation();
  });

  $rootScope.$on('fetch-user-success', function (event, data) {
    if (service.isAuthenticated()) {
      //TODO: login - ajustar pesquisa inicial
      //service.stepRedirection();
    }
  });

  // Step redirection
  $rootScope.$on('new-signup-progress', function (event, data) { 
    $location.path('/signup/' + data); 
  });

  var service = {
    currentUser: null,

    login: function(email, password, remember_me) {
      return $http.post('http://' + API_SERVER + '/login', {user: {email: email, password: password, remember_me: remember_me}})
      .then(function (response) { // Success
        service.populateUser(response.data);
        if (service.isAuthenticated()) {
          $rootScope.$emit('login-success');
        }
      },
      function (response) { // Error
        $rootScope.$emit('login-error', response.data);
      });
    },

    impersonate: function(email) {
      return $http.post('http://' + API_SERVER + '/impersonate', {client_email: email}, {headers: {
        'X-User-Token': service.currentUser.authentication_token,
        'X-User-Email': service.currentUser.email
      }})
      .then(function (response) { // Success
        service.populateUser(response.data);
        if (service.isAuthenticated()) {
          redirect('/');
        }
      },
      function (response) { // Error
        $rootScope.$emit('impersonate-login-error', response.data);
      });
    },

    fbLogin: function() {
      Facebook.login();
    },

    linkedinAuthorize: function() {
      LinkedIn.authorize();
    },

    googlePlusAuthorize: function() {
      GooglePlus.authorize();
    },

    twitterAuthorize: function() {
      Twitter.authorize();
    },

    facebookAuthorize: function () {
      Facebook.connect();
    },

    logout: function() {
      $http.delete('http://' + API_SERVER + '/logout', {}, {headers: {
        'X-User-Token': service.currentUser.authentication_token,
        'X-User-Email': service.currentUser.email
      }}).then(function (response) {
        service.populateUser(null);
        $rootScope.$emit('logout-success');
        redirect('/');
      });
    },

    register: function(name, email, phone, password) {
      return $http.post('http://' + API_SERVER + '/register', {user: {name: name, email: email, password: password}})
      .then(function (response) { // Success
        service.populateUser(response.data);
        if (service.isAuthenticated()) {
          $rootScope.$emit('signup-success', email);
          return true;
        }
      },
      function (response) { // Error
        $rootScope.$emit('signup-error', response.data);
        return false;
      });
    },

    recover: function(email) {
      return $http.post('http://' + API_SERVER + '/password', {user: {email: email}})
      .then(function (response) { // Success
        $rootScope.$emit('password-recovery-success');
      },
      function (response) { // Error
        $rootScope.$emit('password-recovery-error', response.data);
      });
    },

    resetPassword: function(reset_password_token, password, password_confirmation) {
      return $http.put('http://' + API_SERVER + '/password', {user: {reset_password_token: reset_password_token, password: password, password_confirmation: password_confirmation}})
      .then(function (response) { // Success
        service.populateUser(response.data);
        $rootScope.$emit('login-success');
        $rootScope.$emit('password-set-success');
      },
      function (response) { // Error
        $rootScope.$emit('password-set-error', response.data);
      });
    },

    resendConfirmation: function(email) {
      return $http.post('http://' + API_SERVER + '/confirmation/resend', {user: {email: email}})
      .then(function (response) { // Success
        // service.populateUser(response.data);
        $rootScope.$emit('resend-confirmation-success');
      },
      function (response) { // Error
        $rootScope.$emit('resend-confirmation-error', response.data);
      });
    },

    getCurrentUser: function() {
      // if user already authenticated, return it
      if (service.isAuthenticated()) {
        $rootScope.$emit('fetch-user-success');
        return $q.when(service.currentUser);
      } else {
        // if not, check to see if cookie exists and get user from there
        if(angular.isObject(JSON.parse(window.localStorage.getItem('_tlp_current_user')))) {
          var cookie_user = JSON.parse(window.localStorage.getItem('_tlp_current_user'));
          var remember_date = +new Date(cookie_user.remember_ts * 1000);
          var current_date = +new Date() / 1000;
          if(remember_date >= current_date) {
            return $http.get('http://' + API_SERVER + '/users/' + cookie_user.id + '.json', {headers: {
              'X-User-Token': cookie_user.authentication_token,
              'X-User-Email': cookie_user.email
            }}).then(function (response) { // Success
              service.populateUser(response.data);
              $rootScope.$emit('fetch-user-success');
            },
            function (response) { // Error
              service.populateUser(null);
              $rootScope.$emit('fetch-user-error', response.data);
              return false;
            });
          } else {
            window.localStorage.removeItem('_tlp_current_user');
            $rootScope.$emit('fetch-user-error', {errors: ['cookie is old']});
            return false;
          }
        } else {
          $rootScope.$emit('fetch-user-error', {errors: ['no user from cookie']});
          return false;
        }
      }
    },

    userConfirmed: function() {

      if(angular.isObject(window.localStorage.getItem('_tlp_confirmation_success'))) {
        var confirmation_cookie = JSON.parse(window.localStorage.getItem('_tlp_confirmation_success'));
        if (confirmation_cookie.status) {
          $rootScope.$emit('login-open', {confirmation: true});
          window.localStorage.removeItem('_tlp_confirmation_success');
          service.handleConfirmationForMba();
          return true;
        }else{
          return false;
        }
      }
    },

    handleConfirmationForMba: function () {

      if(angular.isObject(window.localStorage.getItem('_tlp_mba_registration'))) {
        var mba_registration_proccess = JSON.parse(window.localStorage.getItem('_tlp_mba_registration'));
        if (mba_registration_proccess.status) {
          window.localStorage.removeItem('_tlp_mba_registration');
          $rootScope.$emit('confirmation_redirect_mba', mba_registration_proccess.url);
        }
      }

    },

    userHasRole: function(role) {
      if (service.currentUser){
        var user_roles = service.currentUser.roles;
        if (user_roles.length) {
          for(var i=0; i<user_roles.length; i++) {
            if(user_roles[i].name === role) {
              return true;
            }
          }
        }
      }
      return false;
    },

    populateEnrollment: function(enroll){
      var enrollment = [];
      enrollment[0] = {program: {name: enroll}, status:1, user_request_certified: false};
      service.currentUser.enrollments = enrollment;
    },

    userHasEnrollment: function(program) {
      var user_enrollments = service.currentUser.enrollments;
      if (user_enrollments && user_enrollments.length) {
        for(var i=0; i<user_enrollments.length; i++) {
          if (user_enrollments[i].status !== 0) {
            if(user_enrollments[i].program.name === program) {
              var enrolled = {
                enrolled: true,
                user_request_certified: user_enrollments[i].user_request_certified
              };
              return enrolled;
            }
          }
        }
      }
      return false;
    },

    userHasField: function(fieldName) {
      if(service.currentUser[fieldName]) {
        return true;
      }
      return false;
    },

    populateUserFromFacebook: function(data) {
      if (!service.isAuthenticated()) {
        service.populateUser(data.data);
        $rootScope.$emit('fetch-user-success');
      }
    },

    populateUser: function(data) {
      if(data) {
        service.currentUser = data;
        window.localStorage.setItem('_tlp_current_user', JSON.stringify({
          name: service.currentUser.name,
          email: service.currentUser.email,
          id: service.currentUser.id,
          authentication_token: service.currentUser.authentication_token,
          remember_ts: service.currentUser.remember_ts || (Date.now() + 3600 * 2)
        }));
      } else {
        service.currentUser = null;
        window.localStorage.removeItem('_tlp_current_user');
      }
    },

    isAuthenticated: function() {
      return !!service.currentUser;
    },

    stepRedirection: function () {
      // console.log('Checking step redirection');
      if(service.userHasField('user_profile')) {
        // console.log('User has a profile');
        if(service.currentUser.user_profile.step) {
          // console.log('User has a profile step');
          if(service.currentUser.user_profile.step < 5) {
            // console.log('User profile step < 5');
            $rootScope.$emit('new-signup-progress', service.currentUser.user_profile.step);
          } else {
            // console.log('User profile step >= 5');
            return false;
          }
        } else {
          // console.log('User has no profile step');
          $rootScope.$emit('new-signup-progress', 1);
        }
      } else {
        // console.log('User has no profile');
        $rootScope.$emit('new-signup-progress', 1);
      }
    }

  };
  
  return service;
}]);
