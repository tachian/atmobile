'use strict';

var browseControllers = angular.module('browseControllers', []);

browseControllers.controller('SubjectsController', ['$scope', 'Subjects',
  function ($scope, Subjects) {
    
    Subjects.query().$promise.then(function(data) {
      $scope.subjects = data;
    });

  }
]);

browseControllers.controller('SubjectController', ['$scope', '$routeParams', 'Subjects', 'Subject', 'ServiceName',
  function ($scope, $routeParams, Subjects, Subject, ServiceName) {
    
    var serviceName = ServiceName.name;

    Subjects.query({query: serviceName, id: $routeParams.id}).$promise.then(function(data) {
      $scope.listCourses = data;
    });

    $scope.subject = {}

    Subject.query({id: $routeParams.id}).$promise.then(function(data) {
      $scope.subject.name = data.name;
      $scope.subject.total_courses = data.total_courses;
    });


  }
]);

browseControllers.controller('UniversitiesController', ['$scope', 'Universities',
  function ($scope, Universities) {
    
    Universities.query().$promise.then(function(data) {
      $scope.universities = data;
    });

  }
]);

browseControllers.controller('UniversityController', ['$scope', '$routeParams', 'Universities', 'ServiceName',
  function ($scope, $routeParams, Universities, ServiceName) {
    
    var serviceName = ServiceName.name;

    Universities.query({query: serviceName, id: $routeParams.id}).$promise.then(function(data){
      $scope.university_name = data[0].university.name
      $scope.listCourses = data;
    });

  }
]);

browseControllers.controller('MyCoursesController', ['$scope', '$http', '$location', 'Users', 'Session',
  function ($scope, $http, $location, Users, Session) {
    
    $scope.current_user = Session.currentUser;

    $scope.listCourses = [];

    if(Session.isAuthenticated()) {
      $http.defaults.headers.common['X-User-Token'] = Session.currentUser.authentication_token;
      $http.defaults.headers.common['X-User-Email'] = Session.currentUser.email;

      Users.query({query: "visits", id: Session.currentUser.id}).$promise.then(function(data){
        angular.forEach(data, function (visit){
          var course = $.grep($scope.listCourses, function(e){ return e.course_id == visit.course_id; });
          if (course.length == 0)
          { 
            course = {};
            course.name = visit.course_name;
            course.teacher = visit.teacher;
            course.university_name = visit.university_name;
            course.total_parts = visit.total_parts;
            course.course_id = visit.course_id;
            course.visiteds = 1;
            course.image = visit.image;
            course.subtitle = visit.subtitle;
            $scope.listCourses.push(course);
          }
          else
          { 
            course = course[0];
            course.visiteds += 1; 
          }

          course.percentComplete = (course.total_parts > 0) ? Math.round(course.visiteds/course.total_parts * 100, 2) : 0;
          
          
        });
        
      });
    }
    else
    {
      //TODO: Move to run block
      $location.path('/').replace();
    }
  }
]);

browseControllers.controller('LecturesController', ['$scope', '$routeParams', '$http', '$location', 'Courses', 'Lectures', 'Visits','Session',
  function ($scope, $routeParams, $http, $location, Courses, Lectures, Visits, Session) {

    $scope.lectures = [];

    var lectures = Lectures.query;
    var serviceParts = "user_parts";

    $scope.state = null;
    $scope.volume = 1;
    $scope.isCompleted = false;
    $scope.API = null;

    if(Session.isAuthenticated()) {

      $http.defaults.headers.common['X-User-Token'] = Session.currentUser.authentication_token;
      $http.defaults.headers.common['X-User-Email'] = Session.currentUser.email;

      $scope.courseInfo = {};

      Courses.query({id: $routeParams.id}).$promise.then(function(data) {
        $scope.courseInfo.name = data.name;
        $scope.courseInfo.university_name = data.university.name;
        $scope.courseInfo.teacher = data.teacher;
        $scope.courseInfo.id = data.id;
        data.lectures.forEach(function (lecture) {
          lectures({query: 'parts', id: lecture.id}).$promise.then(function(data) {
            lecture.parts = data;
            lecture.currentPart = data[0];
            lecture.visited_parts = 0;
            lecture.number_parts = data.length;
            lecture.perc = 0;
            $scope.lectures.push(lecture);
            lecture.parts.forEach(function (part){
              if(part.is_visited){
                lecture.currentPart = part;
                lecture.visited_parts += 1;
                lecture.perc = percComplete(lecture.visited_parts, lecture.parts.length);
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

      Session.currentUser.is_new = false;
      Session.currentUser.is_visited_courses = true;

      var urlVideo = "http://m.youtube.com/watch?v="+currentPart.url.trim();
      var urlSubtitle = "http://tulupa.s3.amazonaws.com/subtitles/"+lecture.subtitle+"?true";
      $scope.currentLecture = {lecture: lecture, part: currentPart, url: urlVideo, urlSubtitle: urlSubtitle};
      var visitedPartContents = {
        course_id: $scope.courseInfo.id,
        lecture_id: lecture.id,
        part_id: currentPart.id,
        user_id: Session.currentUser.id,
        time: 0
      };

      var indexLecture = $scope.lectures.indexOf(lecture);
      var indexPart = $scope.lectures[indexLecture].parts.indexOf(currentPart);
      if(!$scope.lectures[indexLecture].parts[indexPart].is_visited){
        Visits.save(visitedPartContents).$promise.then(function (response) {
          $scope.lectures[indexLecture].parts[indexPart].is_visited = true;
          $scope.lectures[indexLecture].visited_parts++;
          $scope.lectures[indexLecture].perc = percComplete($scope.lectures[indexLecture].visited_parts, $scope.lectures[indexLecture].parts.length);
          $scope.lectures[indexLecture].currentPart.visited = true;
        });
      };
    };


    $scope.destroyPlayer = function(){
      window.localStorage.setItem('_tlp_player_' + $scope.currentLecture.part.id, JSON.stringify({
        time: parseInt(this.player.currentTime())}
        ));
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