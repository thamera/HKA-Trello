/* global angular, context, t*/

(function () {
    'use strict';

    angular
        .module('app')
        .controller('mysettingsCtrlAs', mysettingsCtrlAs)

    mysettingsCtrlAs.$inject = ['mysettingsService'];
  
    function mysettingsCtrlAs(mysettingsService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'My Settings';
        vm.removeFreshdesk = removeFreshdesk;
        vm.removeTrello = removeTrello;

        activate();

        function activate() {
          console.log("mysettings.controller>activate");
          console.groupCollapsed("Initialize My Settings");
          
          mysettingsService.init()
          .then(function (data) {
            vm.settings = mysettingsService.settings;
            vm.context = context;
            console.dir(vm);
            console.groupEnd();  // End Initialize Console Group
          });
        }
      
      function removeFreshdesk() {
        t.remove('member','private','freshdeskApiKey');
        vm.settings.member.freshdeskApiKey = '';
        console.log("Removed Freshdesk API Key...");
      }
      
      function removeTrello() {
        mysettingsService.forgetTrello();
        t.remove('member','private','token')
        .then(function(){
          console.log("Removed Trello Token...");
          t.closeModal();
        });
      }
    }
})();
