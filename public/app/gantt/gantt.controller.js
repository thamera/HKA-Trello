/* global angular, t */

(function () {
    'use strict';

  angular
    .module('app')
    .controller('ganttCtrlAs', ganttCtrlAs)
    .config(["agcLibraryLoaderProvider", function(agcLibraryLoaderProvider){
        agcLibraryLoaderProvider.setLoader("gstatic");
    }])
    .config(["agcGstaticLoaderProvider", function(gstaticProvider){
        gstaticProvider.addPackage("corechart");
        //gstaticProvider.setOption("mapsApiKey", "INSERT YOUR KEY HERE");
    }]);

    ganttCtrlAs.$inject = ['$scope', '$q', 'ganttService'];

    function ganttCtrlAs($scope, $q, ganttService) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Board Schedule';
      vm.test = test;
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
      
      /*vm.data = [
        {name: 'Status meetings', tasks: [
            {name: 'Demo #1', color: '#9FC5F8', from: new Date(2013, 9, 25, 15, 0, 0), to: new Date(2013, 9, 25, 18, 30, 0)},
            {name: 'Demo #2', color: '#9FC5F8', from: new Date(2013, 10, 1, 15, 0, 0), to: new Date(2013, 10, 1, 18, 0, 0)},
            {name: 'Demo #3', color: '#9FC5F8', from: new Date(2013, 10, 8, 15, 0, 0), to: new Date(2013, 10, 8, 18, 0, 0)},
            {name: 'Demo #4', color: '#9FC5F8', from: new Date(2013, 10, 15, 15, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0)},
            {name: 'Demo #5', color: '#9FC5F8', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 24, 10, 0, 0)}
        ]},
        {name: 'Kickoff', tasks: [
            {name: 'Day 1', color: '#9FC5F8', from: new Date(2013, 9, 7, 9, 0, 0), to: new Date(2013, 9, 7, 17, 0, 0)},
            {name: 'Day 2', color: '#9FC5F8', from: new Date(2013, 9, 8, 9, 0, 0), to: new Date(2013, 9, 8, 17, 0, 0)},
            {name: 'Day 3', color: '#9FC5F8', from: new Date(2013, 9, 9, 8, 30, 0), to: new Date(2013, 9, 9, 12, 0, 0)}
        ]}
      ];*/
      
      vm.myChartObject = {
        type: 'Gantt',
        
        options: {
          'title': 'Trello Board Schedule',
          gantt: {
            criticalPathEnabled: true,
            criticalPathStyle: {
              stroke: '#e64a19',
              strokeWidth: 5
            }
          }
        },
        data: {
          "cols": [
            {id: 'id', label: 'Task ID', type:'string'},
            {id: 'name', label: 'Task Name', type:'string'},
            {id: 'resource', label: 'Resource', type:'string'},
            {id: 'start', label: 'Start Date', type:'date'},
            {id: 'end', label: 'End Date', type:'date'},
            {id: 'duration', label: 'Duration', type:'number'},
            {id: 'complete', label: 'Percent Complete', type:'number'},
            {id: 'dependency', label: 'Dependencies', type:'string'},
          ],
          "rows": []
        }
      }

      function daysToMilliseconds(days) {
        return days * 24 * 60 * 60 * 1000;
      }
      
      activate();

      function activate() {
        console.dir(vm.myChartObject);
        ganttService.init()
        .then(function (data) {
          console.log("set ctrl model");
          vm.myChartObject.data.rows = ganttService.formatMilestones();
          vm.data = ganttService.setupGantt();
          vm.model = ganttService.model;
          
          /*vm.data = [
            {name: 'Status meetings', tasks: [
                {name: 'Demo #1', color: '#9FC5F8', from: new Date(2013, 9, 25, 15, 0, 0), to: new Date(2013, 9, 25, 18, 30, 0)},
                {name: 'Demo #2', color: '#9FC5F8', from: new Date(2013, 10, 1, 15, 0, 0), to: new Date(2013, 10, 1, 18, 0, 0)},
                {name: 'Demo #3', color: '#9FC5F8', from: new Date(2013, 10, 8, 15, 0, 0), to: new Date(2013, 10, 8, 18, 0, 0)},
                {name: 'Demo #4', color: '#9FC5F8', from: new Date(2013, 10, 15, 15, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0)},
                {name: 'Demo #5', color: '#9FC5F8', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 24, 10, 0, 0)}
            ]},
            {name: 'Kickoff', tasks: [
                {name: 'Day 1', color: '#9FC5F8', from: new Date(2013, 9, 7, 9, 0, 0), to: new Date(2013, 9, 7, 17, 0, 0)},
                {name: 'Day 2', color: '#9FC5F8', from: new Date(2013, 9, 8, 9, 0, 0), to: new Date(2013, 9, 8, 17, 0, 0)},
                {name: 'Day 3', color: '#9FC5F8', from: new Date(2013, 9, 9, 8, 30, 0), to: new Date(2013, 9, 9, 12, 0, 0)}
            ]}
          ];*/
          //console.dir(vm.data);
        });
      }
      
      function test() {
        console.dir(vm.myChartObject);
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