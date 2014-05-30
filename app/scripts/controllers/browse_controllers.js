'use strict';

var browseControllers = angular.module('browseControllers', []);

browseControllers.controller('SubjectController', ['$scope', 'Subjects',
  function ($scope, Subjects) {
    
    Subjects.query().$promise.then(function(data) {
      $scope.subjects = data;
    });

  }
]);

browseControllers.controller('UniversityController', ['$scope', 'Universities',
  function ($scope, Universities) {
    
    Universities.query().$promise.then(function(data) {
      $scope.universities = data;
    });

  }
]);

browseControllers.controller('CoursesController', ['$scope', '$routeParams', 'Courses', 'ServiceName',
  function ($scope, $routeParams, Courses, ServiceName) {
    
    var serviceName = ServiceName.name;

    Courses.query({service: serviceName, id: $routeParams.id}).$promise.then(function(data){
      $scope.listCourses = data;
    });

  }
]);

browseControllers.controller('MyCoursesController', ['$scope', '$http', '$location', 'MyCourses', 'Session',
  function ($scope, $http, $location, MyCourses, Session) {
    
    $scope.current_user = function () { 
      return Session.currentUser; 
    };

    if(Session.isAuthenticated()) {
      $http.defaults.headers.common['X-User-Token'] = Session.currentUser.authentication_token;
      $http.defaults.headers.common['X-User-Email'] = Session.currentUser.email;

      MyCourses.query().$promise.then(function(data){
        angular.forEach(data, function (course){
          course.percentComplete = (course.total_parts > 0) ? Math.round(course.visiteds/course.total_parts * 100, 2) : 0;
        });
        $scope.listCourses = data;
      });
    }
    else
    {
      //TODO: Move to run block
      $location.path('/');
    }
  }
]);

browseControllers.controller('MbaController', ['$scope', '$http', '$location', 'UserMbaEnrollment', 'CourseProgress', 'Session',
  function ($scope, $http, $location, UserMbaEnrollment, CourseProgress, Session) {
    
    if(Session.isAuthenticated()) {
      $http.defaults.headers.common['X-User-Token'] = Session.currentUser.authentication_token;
      $http.defaults.headers.common['X-User-Email'] = Session.currentUser.email;

      var mbaName = {name: 'mba_ei'};
      UserMbaEnrollment.get(mbaName).$promise.then(function (response){
        $scope.mbaInfo = {};
          
        var program = {};
        program.name = response.program_name;
        program.courses = response.courses;
        program.percentComplete = 0;
        program.numCols = 2;
        program.rows = [];
        program.cols = [];
        program.rows.length = Math.ceil(response.courses.length / program.numCols);
        program.cols.length = program.numCols;
        
        angular.forEach(program.courses, function (course){

          // Request percentage from each course      
          CourseProgress.get({course_id: course.id}).$promise.then(function (response) {
            course.percentComplete = (response.total_parts > 0) ? Math.round((response.part_visiteds/response.total_parts) * 100, 2) : 0;
            program.percentComplete = (program.percentComplete + (course.percentComplete/ program.courses.length));
          });
        });
    
        $scope.mbaInfo = program;
      });
    }
    else
    {
      $location.path('/');
    }
  }
]);

browseControllers.controller('LecturesController', ['$scope', '$routeParams', '$http', '$location', 'CourseInfo', 'Lectures', 'Parts', 'VisitedPart', 'Session',
  function ($scope, $routeParams, $http, $location, CourseInfo, Lectures, Parts, VisitedPart, Session) {


    $scope.lectures = [];

    var parts = Parts.get;
    var serviceParts = "user_parts";

    $scope.state = null;
    $scope.volume = 1;
    $scope.isCompleted = false;
    $scope.API = null;

    if(Session.isAuthenticated()) {

      if(Session.userHasEnrollment('mba_ei').user_request_certified){
        serviceParts = "user_parts_certified";
      }

      CourseInfo.query({service: 'course_info', id: $routeParams.id}).$promise.then(function(data) {
        $scope.courseInfo = data;
      });

      $http.defaults.headers.common['X-User-Token'] = Session.currentUser.authentication_token;
      $http.defaults.headers.common['X-User-Email'] = Session.currentUser.email;
    
      Lectures.query({service: 'course_visiteds', id: $routeParams.id}).$promise.then(function(data) {
        data.forEach(function (listItem) {

          parts({service: serviceParts, id: listItem.id}).$promise.then(function(data) {
            listItem.parts = data;
            listItem.perc = percComplete(listItem.visited_parts, listItem.parts.length);
            $scope.lectures.push(listItem);
            listItem.currentPart = data[0];
            data.forEach(function (part){
              if(part.visited){
                listItem.currentPart = part;
              } 
            });
          });
        });
      });
    }
    else
    {
      $location.path('/');
    };

    $scope.nextPart = function(data) {
      var index = $scope.lectures.indexOf(data);
      var parts = $scope.lectures[index].parts;
      if ($scope.lectures[index].currentPart.order < parts[parts.length - 1].order){
        var indexPart = $scope.lectures[index].parts.indexOf($scope.lectures[index].currentPart);
        $scope.lectures[index].currentPart = $scope.lectures[index].parts[indexPart + 1];
      }
    };

    $scope.previousPart = function(data) {
      var index = $scope.lectures.indexOf(data);
      if ($scope.lectures[index].currentPart.order > $scope.lectures[index].parts[0].order){
        var indexPart = $scope.lectures[index].parts.indexOf($scope.lectures[index].currentPart);
        $scope.lectures[index].currentPart = $scope.lectures[index].parts[indexPart - 1];
      }
    };

    $scope.showPlayer = function(lecture, currentPart){
      $scope.currentLecture = {lecture: lecture, part: currentPart};
      var visitedPartContents = {
        course_id: $scope.courseInfo.id,
        lecture_id: lecture.id,
        part_id: currentPart.id,
        time: 0
      };
      VisitedPart.save(visitedPartContents).$promise.then(function (response) {
        var indexLecture = $scope.lectures.indexOf(lecture);
        var indexPart = $scope.lectures[indexLecture].parts.indexOf(currentPart);
        if(!$scope.lectures[indexLecture].parts[indexPart].visited){
          $scope.lectures[indexLecture].parts[indexPart].visited = true;
          $scope.lectures[indexLecture].visited_parts++;
          $scope.lectures[indexLecture].perc = percComplete($scope.lectures[indexLecture].visited_parts, $scope.lectures[indexLecture].parts.length);
          $scope.lectures[indexLecture].currentPart.visited = true;
        };
      });
    };


    $scope.destroyPlayer = function(){
      $scope.currentLecture = "";
    };


    function percComplete(visitedParts, totalParts){
      var perc = Math.round(visitedParts/totalParts * 100);
      if(perc > 100){
        perc = 100;
      }
      return perc;
    }


  }
]);