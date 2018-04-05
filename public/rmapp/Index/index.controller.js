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
            title: 'Board Resourcing',
            url: '#/',
          icon: 'https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2Fonebit_01.png?1516839208407'
        }, {
            title: 'Team Resourcing',
            url: '#/team',
          icon: 'https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2F008.png?1516838754246'
        }];
        vm.currentTab = 'Board'
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
