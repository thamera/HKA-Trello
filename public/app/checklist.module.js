/* global angular */

(function () {
    'use strict';

    angular
        .module('app', [
          // Angular modules    
          //'ngRoute',
          'ngSanitize',
          
          // Custom modules

          // 3rd Party Modules
          'ui.grid',
          'ui.grid.grouping',
          'ui.grid.selection'
        ])
        //.config(routeConfig)
        .config(compileProvider);
  
  //routeConfig.$inject = ['$routeProvider'];   
  compileProvider.$inject = ['$compileProvider'];
  
  //function routeConfig($routeProvider) {
  //      $routeProvider
  //          .when('/', { templateUrl: 'app/checklist/checklist.html' })
  //          .otherwise({ redirectTo: '/' });
  //  }
  
  function compileProvider($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel):/);

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob):|data:image\/)/);
    }
})();
