'use strict';

var browseServices = angular.module('browseServices', ['ngResource']);

browseServices.factory('Subjects', ['$resource', 'API_SERVER', function($resource, API_SERVER) {
  return $resource('http://:url/:service/:id/:query.:format', {url: API_SERVER, service: '', format: 'json'}, {
    query: {method:'GET', params:{service: 'subjects'}, isArray:true}
  });
}]);

browseServices.factory('Universities', ['$resource', 'API_SERVER', function($resource, API_SERVER) {
  return $resource('http://:url/:service/:id/:query.:format', {url: API_SERVER, service: '', format: 'json'}, {
    query: {method:'GET', params:{service: 'universities'}, isArray:true}
  });
}]);

browseServices.factory('Courses', ['$resource', 'API_SERVER', function($resource, API_SERVER) {
  return $resource('http://:url/:service/:id/:query.:format', {url: API_SERVER, service: '', format: 'json'}, {
    query: {method:'GET', params:{query: 'courses'}, isArray:false}
  });
}]);

browseServices.factory('CourseInfo', ['$resource', 'API_SERVER', function($resource, API_SERVER){
  return $resource('http://:url/:service/:id/:query.:format', {url:API_SERVER, service: ''},{
    query: {method: 'GET', params: {service: 'course_info', id: '@id'}, isArray:false}
  });
}]);

browseServices.factory('Lectures', ['$resource', 'API_SERVER', function($resource, API_SERVER) {
  return $resource('http://:url/:service/:id/:query.:format',  {url: API_SERVER, service: '', format: 'json'}, {
    query: {method:'GET', params:{query: 'lectures'}, isArray:true}
  });
}]);

browseServices.factory('Parts', ['$resource', 'API_SERVER', function($resource, API_SERVER){
  return $resource('http://:url/:service/:id/parts', {url:API_SERVER, service: ''},{
    get: {method: 'GET', params: {}, isArray:true}
  });
}]);

browseServices.factory('MyCourses', ['$resource', 'API_SERVER', function($resource, API_SERVER) {
  return $resource('http://:url/:service/:course_id/:query.:format', {url: API_SERVER, format: 'json'}, {
    query: {method: 'GET', params: {service: 'user_visited_courses'}, isArray: true}
  });
}]);

browseServices.factory('VisitedPart', ['$resource', 'API_SERVER', function($resource, API_SERVER){
  return $resource('http://:url/:service/:lecture_id/:part_id/:query', {url: API_SERVER, service: ''},{
    save: {method: 'POST', params: {service: 'save_part_visit'}}
  });
}]);

browseServices.factory('UserMbaEnrollment', ['$resource', 'API_SERVER', function($resource, API_SERVER) {
  return $resource('http://:url/:service/:name/:query.:format', {url: API_SERVER, format: 'json'}, {
    get: {method: 'GET', params: {service: 'enrollment_program_data', name: '@name'}, isArray: false}
  });
}]);

browseServices.factory('CourseProgress', ['$resource', 'API_SERVER', function($resource, API_SERVER) {
  return $resource('http://:url/:service/:course_id/:query.:format', {url: API_SERVER, format: 'json'}, {
    get: {method: 'GET', params: {service: 'course_progress', course_id: '@course_id'}, isArray:false}
  });
}]);