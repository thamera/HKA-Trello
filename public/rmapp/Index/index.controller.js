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
          icon: 'https://trelloapp.hka-tech.com/images/contact.png'
        }, {
            title: 'Team Resourcing',
            url: '#/team',
          icon: 'https://trelloapp.hka-tech.com/images/contacts.png'
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
