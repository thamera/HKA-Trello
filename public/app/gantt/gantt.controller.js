/* global angular, t */

(function () {
    'use strict';

  angular
    .module('app')
    .controller('ganttCtrlAs', ganttCtrlAs)

    ganttCtrlAs.$inject = ['$scope', '$q', 'ganttService'];

    function ganttCtrlAs($scope, $q, ganttService) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Board Schedule';
      vm.getToday = new Date();
      vm.columns = ['from', 'to'];
      vm.columnHeadings = {'from':'Start','to':'Finish'};
      vm.columnsFormatters = {
          'from': function(from) {
              return from !== undefined ? from.format('MM/DD/YYYY') : undefined;
          },
          'to': function(to) {
              return to !== undefined ? to.format('MM/DD/YYYY') : undefined;
          }
      };
      vm.treeHeaderContent = '<i class="fa fa-align-justify"></i> {{getHeader()}}'
      vm.columnsHeaderContents = {
          'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
          'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
          'to': '<i class="fa fa-calendar"></i> {{getHeader()}}'
      }
      vm.tooltips = '{{task.model.name}}</br>' +
                    '<small>' +
                    '{{task.isMilestone() === true && getFromLabel() || getFromLabel() + \' - \' + getToLabel()}}' +
                    '</small>' +
                    '</br>Status: {{task.model.status}}'
      vm.headerTemplate = '{{getLabel(header)}} <i class="fa fa-calendar"></i>'
      vm.registerGanttApi = registerGanttApi;
           
      activate();

      function activate() {
        console.dir(vm.myChartObject);
        ganttService.init()
        .then(function (data) {
          console.log("set ctrl model");
          vm.data = ganttService.setupGantt();
          vm.model = ganttService.model;
        });
      }
      
      function registerGanttApi(api){
        api.core.on.ready($scope, function () {
          // Call API methods and register events.
          api.side.setWidth(undefined);
        });
        api.directives.on.new($scope, function(dName, dScope, dElement, dAttrs, dController) {
          if (dName === 'ganttTask') {
            dElement.bind('click', function(event) {
              t.showCard(dScope.task.model.cardId);
            });
          }
        });
      }
    }
})();