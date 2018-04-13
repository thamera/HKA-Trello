/* global angular,t,context */

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
          { name: 'Board', field: 'boardName', pinnedLeft:true,width:'250',grouping: { groupPriority: 0 } },
          { name:'Resource', field: 'member',pinnedLeft:true,width:'175'}
        ]
      }
      vm.updateSetting = updateSetting;
      vm.hka_reportingstart = new Date();
      vm.hka_reportingfinish = new Date();
      
      vm.GridOptions = {
        enableGridMenu: true,
        enableSorting: true,
        enableRowSelection: true,groupingShowGroupingMenu: true,
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
        //t.getAll()
        //.then(function (data) {
        //  console.log(JSON.stringify(data, null, 2));
        //});
        //console.dir(context);
      }
      
      function registerGrid(gridApi) {
        vm.myGridApi = gridApi;
      }
      
      function selectionChanged(rowChanged) {

      }
      
      function updateSetting(settingName) {
        console.log("team.controller>updateSetting"); 
        /*t.set('board','shared',settingName,vm.model[settingName])
        .then(function(data){
          vm.model.timeValues = teamService.getMonthsArray(vm.model.hka_targetstart,vm.model.hka_targetfinish);
          
          vm.grid.columns = [
            { name:'Resource', field: 'member',pinnedLeft:true,width:'175'}
          ];
          resetColumns();
          vm.GridOptions.columnDefs = vm.grid.columns;
          vm.myGridApi.core.notifyDataChange( uiGridConstants.dataChange.ALL );
        });*/
        vm.model.timeValues = teamService.getMonthsArray(vm.hka_reportingstart,vm.hka_reportingfinish);
        vm.grid.columns = [
          { name: 'Board', field: 'boardName', pinnedLeft:true,width:'250',grouping: { groupPriority: 0 } },
          { name:'Resource', field: 'member',pinnedLeft:true,width:'175'}
        ];
        resetColumns();
        vm.GridOptions.columnDefs = vm.grid.columns;
        vm.myGridApi.core.notifyDataChange( uiGridConstants.dataChange.ALL );
        
      }
      
      function resetColumns () {
        if (vm.model.timeValues) {
          for (var c = 0; c < vm.model.timeValues.length; c++) {
            vm.grid.columns.push({ name: vm.model.timeValues[c]
                                  ,field: vm.model.timeValues[c]
                                  ,type: 'number',
                                  width: '90'
                                 } );
          }
        }
      }
    }
})();
