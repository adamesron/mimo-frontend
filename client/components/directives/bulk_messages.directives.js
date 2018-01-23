'use strict';

var app = angular.module('myApp.bulk_messages.directives', []);

app.directive('sendBulkMessage', ['$routeParams', 'BulkMessage', '$mdDialog', function($routeParams,BulkMessage,$mdDialog) {

  var link = function( scope, element, attrs ) {

    var send = function(message) {
      BulkMessage.create({}, {
        location_id: $routeParams.id,
        bulk_message: message
      }).$promise.then(function(msg) {
        console.log(msg);
      });
    };

    scope.compose = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'components/views/bulk_messages/_compose.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
        .then(function(answer) {
        }, function() {
        });
    };

    function DialogController($scope, $mdDialog) {

      scope.message = {}

      $scope.selectedIndex = 0;

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.back = function() {
        if ($scope.selectedIndex > 0) {
          $scope.selectedIndex--;
        }
      };

      $scope.next = function() {
        if ($scope.selectedIndex < 3) {
          $scope.selectedIndex++;
        }
      };

      $scope.send = function(message) {
        $scope.cancel();
        send(message);
      };
    }

  };

  var template =
    '<div><md-button ng-click="compose()" class=\'md-raised md-primary\'>SEND</md-button></div>';

  return {
    link: link,
    template: template
  };

}]);

app.directive('bulkMessages', ['$routeParams', 'BulkMessage', '$mdDialog', '$location', function($routeParams,BulkMessage,$mdDialog,$location) {

  var link = function( scope, element, attrs ) {

    var init = function() {
      BulkMessage.index({}, {
        q:            $routeParams.q,
        location_id:  $routeParams.id,
        start:        $routeParams.start,
        end:          $routeParams.end
      }).$promise.then(function(results) {
        scope.loading = undefined;
        scope.messages = results.messages;
      });
    };

    scope.query = function(query) {
      var hash            = {};
      hash.q              = query;
      hash.per            = $routeParams.per || 100;
      hash.start          = $routeParams.start;
      hash.end            = $routeParams.end;
      $location.search(hash);
      init();
    };

    init();
  };

  return {
    link: link,
    scope: {
      loading: '='
    },
    templateUrl: 'components/views/bulk_messages/_index.html'
  };

}]);