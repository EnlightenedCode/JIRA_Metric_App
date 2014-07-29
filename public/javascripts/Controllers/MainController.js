(function(){
  var app = angular.module("JIRAVisual");
  
  var MainController = function(
    $scope, jiraDemo,  $http , $log, $q, $timeout) {
      $scope.today = function() {
        $scope.dt = new Date();
      };
      $scope.today();
    
      $scope.clear = function () {
        $scope.dt = null;
      };
    
      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        
        $scope.opened = true;
      };
      $scope.open2 = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        
        $scope.opened2 = true;
      };    
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
      
      //$scope.alerts.push({msg: "BLAHHHH"});
      $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];      
      
      
      
      $scope.iterations = [];
      var iterationCount = 0;
      var iterationToAdd = {
        iterationId: 0,
        startDate: undefined,
        endDate: undefined,
        bugs: 0,
        reopens: 0,
        features: 0,
        extraHrs: 0,
        qaScore: 0,
        days: 0
      };
      
      
      var bugsComplete = function(data){
        //$log.info("Getting data: " + data.length);
        iterationToAdd.bugs = data.length;
        jiraDemo.getReopens($scope.iteration.startDate, $scope.iteration.endDate).then(reopensComplete, onError);
      };
      
      var reopensComplete = function(data){
        //$log.info("Getting data: " + data[0].total);
        iterationToAdd.reopens = data[0].total;
        iterationToAdd.extraHrs = jiraDemo.getExtraHrs();
        jiraDemo.getFeatures($scope.iteration.startDate, $scope.iteration.endDate).then(featuresComplete, onError);
      };
      
      var featuresComplete = function(data){
        $log.info("Getting data: " + data.length);
        iterationToAdd.features = data[0].total;
        iterationToAdd.qaScore = jiraDemo.getQAScore();
        iterationToAdd.days = jiraDemo.workingDaysBetweenDates(new Date($scope.iteration.startDate),new Date($scope.iteration.endDate));
        $scope.iterations.push({
          iterationId: iterationCount,
          startDate: $scope.iteration.startDate,
          endDate: $scope.iteration.endDate,
          bugs: iterationToAdd.bugs,
          reopens: iterationToAdd.reopens,
          features: iterationToAdd.features,
          extraHrs: iterationToAdd.extraHrs,
          qaScore: iterationToAdd.qaScore,
          days: iterationToAdd.days
        });
      };      
      
      var onError = function(reason) {
        console.log('ERROR', reason);
        $scope.alerts = [];
        $scope.alerts.push({msg: reason});
        //$scope.error = "Could not fetch the data.";
      }
      
      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      
      $scope.addIteration = function(){
        iterationCount += 1;
        jiraDemo.getBugsFound($scope.iteration.startDate, $scope.iteration.endDate).then(bugsComplete, onError);
      };
      
      $scope.message = "Hello from Angular";
    };
    

  
  app.controller("MainController", ["$scope","jiraDemo", "$http", "$log","$q", "$timeout", MainController]);
}());
