/* global angular,t,context, moment */

(function () {
  'use strict';

  angular
      .module('app')
      .controller('teamCtrlAs', teamCtrlAs);

  teamCtrlAs.$inject = ['$scope','teamService','uiGridConstants'];

  function teamCtrlAs($scope,teamService,uiGridConstants) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'Team Resources';
    vm.model = {hka_resourceColumns:[],
                data:[]};
    vm.grid = {
      columns: [
        { name:'Resource', field: 'member',pinnedLeft:true,width:'175'}, //,grouping: { groupPriority: 0 }},
        { name: 'Board', field: 'boardName', pinnedLeft:true,width:'250' }
        
      ]
    }
    vm.updateSetting = updateSetting;
    vm.hka_reportingstart = new Date();
    vm.hka_reportingfinish = moment().add(6,'months'); //new Date();
    
    vm.GridOptions = {
      enableGridMenu: true,
      showGridFooter: true,
      enableSorting: true,
      enableFiltering: true,
      enableRowSelection: true,
      groupingShowGroupingMenu: true,
      showColumnFooter: true,
      //enableSelectAll: true,
      selectionRowHeaderWidth: 35,
      //multiSelect: true,
      showGridFooter: true,
      rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'ui-grid-disabled\': row.entity.isExported  }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div>',
      columnDefs: vm.grid.columns,
      data: vm.model.data
    }
    
    vm.GridOptions.onRegisterApi = registerGrid;
    
    activate();

    function activate() {
      teamService.init()
      .then(function (data) {
        vm.model = teamService.model;
        //console.dir(vm.model);
        
        resetColumns();
        
        vm.GridOptions.data = vm.model.data;
      });
    }
    
    function registerGrid(gridApi) {
      vm.myGridApi = gridApi;
    }
    
    function selectionChanged(rowChanged) {

    }
    
    function updateSetting(settingName) {
      console.log("team.controller>updateSetting"); 
      vm.model.timeValues = teamService.getMonthsArray(vm.hka_reportingstart,vm.hka_reportingfinish);
      vm.grid.columns = [
        { name:'Resource', field: 'member',pinnedLeft:true,width:'175'}, //,grouping: { groupPriority: 0 }},
        { name: 'Board', field: 'boardName', pinnedLeft:true,width:'250' }
        
      ];
      resetColumns();
      vm.GridOptions.columnDefs = vm.grid.columns;
      vm.myGridApi.core.notifyDataChange( uiGridConstants.dataChange.ALL );
      
    }
    
    function resetColumns () {
      console.dir(vm.model);
      if (vm.model.timeValues) {
        for (var c = 0; c < vm.model.timeValues.length; c++) {
          vm.grid.columns.push({ name: vm.model.timeValues[c]
                                ,field: vm.model.timeValues[c]
                                ,type: 'number',
                                width: '90',
                                aggregationType: uiGridConstants.aggregationTypes.sum
                               } );
        }
      }
    }
  }
})();
