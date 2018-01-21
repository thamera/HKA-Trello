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
            url: '#/'
        }, {
            title: 'Card Printer',
            url: '#/cardprinter'
        }, {
            title: 'Risk Register',
            url: '#/riskmgmt'
        }, {
            title: 'Sprint Reporting',
            url: '#/sprintreport'
        }, {
          title: 'My Settings',
          url: '#/mysettings'
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
