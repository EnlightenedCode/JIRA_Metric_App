(function(){
  var app = angular.module("JIRAVisual");
  
  var DemoController = function(
    $scope, jiraDemo,  $http , $log, $q, $timeout) {


      $scope.iterations = [];
      $scope.averages = {
          bugsFound: 0,
          reopens: 0,
          features: 0,
          extraHrs: 0,
          qaScore: 0,
          days: 0
      };
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
      var bugsFoundSum = 0;
      var reopensSum = 0;
      var featuresSum = 0;
      var extraHrsSum = 0;
      var qaScoreSum = 0;
      var daysSum = 0;


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

      $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];      



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


        bugsFoundSum += iterationToAdd.bugs;
        reopensSum += iterationToAdd.reopens;
        featuresSum += iterationToAdd.features;
        extraHrsSum += iterationToAdd.extraHrs;
        qaScoreSum += iterationToAdd.qaScore;
        daysSum += iterationToAdd.days;

        $scope.averages.bugsFound = bugsFoundSum / iterationCount;
        $scope.averages.reopens = reopensSum / iterationCount;
        $scope.averages.features = featuresSum / iterationCount;
        $scope.averages.extraHrs = extraHrsSum / iterationCount;
        $scope.averages.qaScore = qaScoreSum / iterationCount;
        $scope.averages.days = daysSum / iterationCount;


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
      };
      
      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      
      $scope.addIteration = function(){
        iterationCount += 1;
        jiraDemo.getBugsFound($scope.iteration.startDate, $scope.iteration.endDate).then(bugsComplete, onError);
      };

      $scope.deleteIteration = function ( idx) {
          iterationCount -= 1;

          bugsFoundSum -= $scope.iterations[idx].bugs;
          reopensSum -= $scope.iterations[idx].reopens;
          featuresSum -= $scope.iterations[idx].features;
          extraHrsSum -= $scope.iterations[idx].extraHrs;
          qaScoreSum -= $scope.iterations[idx].qaScore;
          daysSum -= $scope.iterations[idx].days;

          $scope.averages.bugsFound = bugsFoundSum / iterationCount;
          $scope.averages.reopens = reopensSum / iterationCount;
          $scope.averages.features = featuresSum / iterationCount;
          $scope.averages.extraHrs = extraHrsSum / iterationCount;
          $scope.averages.qaScore = qaScoreSum / iterationCount;
          $scope.averages.days = daysSum / iterationCount;
          $scope.iterations.splice(idx, 1);
      };

    };
    

  
  app.controller("DemoController", ["$scope","jiraDemo", "$http", "$log","$q", "$timeout", DemoController]);
}());
