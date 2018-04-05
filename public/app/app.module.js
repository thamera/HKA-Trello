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
          //'ui.bootstrap',
          'ui.grid',
          'ui.grid.grouping',
          'ui.grid.selection',
          'oc.lazyLoad',
          'dndLists',
          'ng-showdown',
          'asideModule'
          //'btford.markdown'
        ])
        .config(routeConfig)
        .config(compileProvider);

    routeConfig.$inject = ['$routeProvider'];
    compileProvider.$inject = ['$compileProvider'];

    function routeConfig($routeProvider) {
        $routeProvider
            .when('/', { templateUrl: 'app/home/home.html' })
            .when('/trellosettings', { templateUrl: 'app/trellosettings/trellosettings.html' })
            .when('/checklisttocard/:cardId', { templateUrl: 'app/checklists/checklists.html' })
            .when('/riskmgmt', { templateUrl: 'app/riskmgmt/riskmgmt.html' })
            .when('/sprintreport', { templateUrl: 'app/sprintreport/sprintreport.html' })
            .when('/releasereport', { templateUrl: 'app/releasereport/releasereport.html' })
            .when('/cardprinter', { templateUrl: 'app/cardprinter/cardprinter.html' })
          .when('/securitylog', { templateUrl: 'app/securityreq/securitylog.html' })
          .when('/mysettings', { templateUrl: 'app/mysettings/mysettings.html' })  
          .otherwise({ redirectTo: '/' });
    }

    function compileProvider($compileProvider) {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|chrome-extension):/);

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
    }
})();
