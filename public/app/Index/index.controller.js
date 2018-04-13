/* global angular */

(function () {
    'use strict';

    angular
        .module('app')
        .controller('indexCtrlAs', indexCtrlAs);

    indexCtrlAs.$inject = ['$location','$scope'];

    function indexCtrlAs($location, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'HKA Board App';
        vm.tabs = [{
            title: 'Home',
            url: '#/',
          icon: 'https://trelloapp.hka-tech.com/images/Home.png'
        }, {
            title: 'Card Printer',
            url: '#/cardprinter',
          icon: 'https://trelloapp.hka-tech.com/images/print.png'
        }, {
            title: 'Risk Register',
            url: '#/riskmgmt',
          icon: 'https://trelloapp.hka-tech.com/images/exclm.png'
        }, {
            title: 'Security Log',
            url: '#/securitylog',
          icon: 'https://trelloapp.hka-tech.com/images/SHIELD_CHECK.png'
        }, {
            title: 'Sprint Reporting',
            url: '#/sprintreport',
          icon: 'https://trelloapp.hka-tech.com/images/diagram-icon.png'
        }, {
          title: 'My Settings',
          url: '#/mysettings',
          icon: 'https://trelloapp.hka-tech.com/images/gear.png'
        }];
        vm.currentTab = 'Home'
        vm.tabClick = tabClick;
        vm.isActiveTab = isActiveTab;

        $scope.$on("getMenuState", function (event, data) {
            $scope.$apply(function () {
                vm.opened = data;
            });
        });

        function tabClick(tab) {
            vm.currentTab = tab.title;
            if (tab.click) {
                var fn = vm[tab.click];
                if (typeof fn === 'function' ) {
                    fn();
                }
            }
        }

        function isActiveTab(tabTitle) {
            return tabTitle == vm.currentTab;
        }

    }
})();
