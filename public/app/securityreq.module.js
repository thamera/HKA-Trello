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
          //'ui.grid.grouping',
          'ui.grid.selection',
          'ui.grid.edit',
          'ui.grid.rowEdit',
          'ui.grid.saveState',
          'ui.grid.resizeColumns',
          'ui.bootstrap',
          'schemaForm'
        ])
        .config(compileProvider);
  
  compileProvider.$inject = ['$compileProvider'];
  
  function compileProvider($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel):/);

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob):|data:image\/)/);
    }
})();
