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
        //console.dir(vm.myChartObject);
        ganttService.init()
        .then(function (data) {
          console.log("set ctrl model");
          vm.data = ganttService.setupGantt();
          vm.model = ganttService.model;
        });
      }
      
      function registerGanttApi(api){
        vm.ganttApi = api
        api.core.on.ready($scope, function () {
          // Call API methods and register events.
          api.side.setWidth(undefined);
          api.dependencies.on.add($scope, function(newData){
            var fromId = newData.task.model.cardId;
            var toId = newData.model.to;
            t.get(toId,'shared','milestone_predecessor')
            .then(function (data) {
              if (fromId == data) return; //user tried to change a dependency but reconnected back to same spot
              
              if(data && data !== ''){
                if(!confirm("Activity already has a predecessor defined.  Click OK to remove the existing predecessor and save this change.")) {return;}
                else {
                  for (var i = 0; i < vm.data.length; i++) {
                    if (vm.data[i].cardId == toId) {
                      if (vm.data[i].tasks[0].dependencies.length == 0) {
                        for (var j = 0; j < vm.data.length; j++) {
                          for(var k = 0; k < vm.data[j].tasks[0].dependencies.length; k++) {
                            if (vm.data[j].cardId != fromId && vm.data[j].tasks[0].dependencies[k].to && vm.data[j].tasks[0].dependencies[k].to == toId){
                              vm.data[j].tasks[0].dependencies.splice(k,1);
                              vm.ganttApi.dependencies.refresh();
                            }
                          }
                        }
                      } else {
                        vm.data[i].tasks[0].dependencies = [];
                        vm.ganttApi.dependencies.refresh();
                      }
                    }
                  }
                }
              }
              t.set(toId, 'shared', 'milestone_predecessor', fromId);
            });
          });
          api.dependencies.on.remove($scope, function(newData){
            var fromId = newData.model.from;
            var toId = newData.task.model.cardId;
            removeDependency(fromId,toId);
          });
        });
        api.directives.on.new($scope, function(dName, dScope, dElement, dAttrs, dController) {
          if (dName === 'ganttTask') {
            dElement.bind('click', function(event) {
              t.showCard(dScope.task.model.cardId);
            });
          }
        });
      }
      
      function removeDependency(fromId,toId){
        t.set(toId, 'shared', 'milestone_predecessor','');
      }
    }
})();