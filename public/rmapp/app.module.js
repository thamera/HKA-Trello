/* global angular */

(function () {
  'use strict';

  angular
    .module('app', [
      // Angular modules
      //'ngAnimate',
      'ngRoute',
      'ngSanitize',

      // Custom modules

      // 3rd Party Modules
      'ui.bootstrap',
      'ui.grid',
      'ui.grid.selection',
      'ui.grid.edit',
      'ui.grid.pinning',
      'oc.lazyLoad',
      'ng-showdown'
    ])
    .config(routeConfig)
    .config(compileProvider);

    routeConfig.$inject = ['$routeProvider'];
    compileProvider.$inject = ['$compileProvider'];

    function routeConfig($routeProvider) {
        $routeProvider
            .when('/', { templateUrl: 'rmapp/board/board.html' })
            .when('/board', { templateUrl: 'rmapp/board/board.html' })
            .when('/team', { templateUrl: 'rmapp/team/team.html' }) 
          .otherwise({ redirectTo: '/' });
    }

    function compileProvider($compileProvider) {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|chrome-extension):/);

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
    }
  
  angular
    .module('app')
    .directive('dateInput', function(){
      return {
        restrict : 'A',
        scope : {
          ngModel : '='
        },
        link: function (scope) {
          if (scope.ngModel) scope.ngModel = new Date(scope.ngModel);
        }
      }
    });
})();
