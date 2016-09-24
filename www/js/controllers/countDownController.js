!function (app) {
  'use strict';

  var $runningInterval;

  app.controller('CountDownController', [
    '$scope', 'timerSet', '$interval', '$window', '$ionicNavBarDelegate',
    function ($scope, timerSet, $interval, $window, $ionicNavBarDelegate) {

      var currentPhaseId = 0;
      var oneSecond = 1000;
      var insomnia = ($window.hasOwnProperty('plugins') && $window.plugins.hasOwnProperty('insomnia')) ? $window.plugins.insomnia : false;

      function preventScreenLock() {
        if (insomnia) {
          insomnia.keepAwake();
        }
      }

      function allowScreenLock() {
        if (insomnia) {
          insomnia.allowSleepAgain();
        }
      }

      function countDown() {
        $scope.time--;
        if ($scope.time < 0) {
          try {
            nextPhase();
            $scope.$emit('sound', $scope.currentPhase);
          } catch (err) {
            resetCountDown();
          }
        }
      }

      function previousPhase() {
        currentPhaseId--;
        if (0 > currentPhaseId) {
          currentPhaseId = 0;
          throw 'Already first phase';
        }
        switchPhase();
      }

      function nextPhase() {
        currentPhaseId++;
        if (timerSet.phases.length <= currentPhaseId) {
          currentPhaseId = timerSet.phases.length - 1;
          throw 'Already last phase'
        }
        switchPhase();
      }

      function switchPhase() {
        $scope.currentPhase = timerSet.phases[currentPhaseId];
        $scope.time = $scope.currentPhase.time;
      }

      function startCountDown() {
        $ionicNavBarDelegate.showBar(false);
        preventScreenLock();
        $scope.running = true;
        $scope.resetted = false;
        $runningInterval = $interval(countDown, oneSecond);
      }

      function stopCountDown() {
        $ionicNavBarDelegate.showBar(true);
        allowScreenLock();
        $scope.running = false;
        $interval.cancel($runningInterval);
        $runningInterval = undefined;
      }

      function resetCountDown() {
        currentPhaseId = 0;
        $scope.time = 0;
        $scope.resetted = true;
        stopCountDown();
        switchPhase();
      }

      function toggleCountDown() {
        if ($scope.running) {
          stopCountDown();
        } else {
          startCountDown();
        }
      }

      $scope.hasInsomnia = insomnia;
      $scope.running = false;
      $scope.resetted = true;
      $scope.currentPhase = timerSet.phases[currentPhaseId];
      $scope.time = $scope.currentPhase.time;
      $scope.timerSet = timerSet;
      $scope.resetCountDown = resetCountDown;
      $scope.startCountDown = startCountDown;
      $scope.stopCountDown = stopCountDown;
      $scope.previousPhase = previousPhase;
      $scope.nextPhase = nextPhase;
      $scope.toggleCountDown = toggleCountDown;
      // Make sure that the interval is destroyed too
      $scope.$on('$destroy', function () {
        stopCountDown();
      });
    }]);

}(window.angular.module('omtimer'));
