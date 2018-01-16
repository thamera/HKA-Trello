/* global angular */

(function () {
    'use strict';

    angular
        .module('app')
        .controller('homeCtrlAs', homeCtrlAs);

    homeCtrlAs.$inject = ['$scope'];

    function homeCtrlAs($scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'home';

        activate();

        function activate() { }
    }
})();
