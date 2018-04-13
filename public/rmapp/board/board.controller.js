/* global angular,t,context */

(function () {
    'use strict';

    angular
        .module('app')
        .controller('boardCtrlAs', boardCtrlAs);

    boardCtrlAs.$inject = ['$scope','boardService','uiGridConstants'];

    function boardCtrlAs($scope,boardService,uiGridConstants) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Board Resources';
      vm.model = {hka_resourceColumns:[],
                  data:[]};
      $scope.deleteRow = deleteRow;
      vm.grid = {
        columns: [
          {
            name: 'Actions',
            cellTemplate: '<button class="btn btn-primary" ng-click="grid.appScope.deleteRow(row)"><i class="fas fa-trash-alt"></i></button>',
            width:'80'
          },
          { name:'Resource', field: 'member',pinnedLeft:true,width:'175'}
        ],
        addRow: addRow,
      }
      vm.updateSetting = updateSetting;
      
      vm.GridOptions = {
        enableGridMenu: true,
        enableSorting: true,
        enableRowSelection: true,
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
        boardService.init()
        .then(function (data) {
          vm.model = boardService.model;
           
          resetColumns();
          
          vm.GridOptions.data = vm.model.data;
        });
      }
      
      function registerGrid(gridApi) {
        vm.myGridApi = gridApi;
        //vm.myGridApi.selection.on.rowSelectionChanged($scope, vm.selectionChanged);
        vm.myGridApi.edit.on.afterCellEdit($scope, rowEdited);
      }
      
      function selectionChanged(rowChanged) {

      }
      
      function rowEdited(rowEntity, colDef, newValue, oldValue) {       
        if (rowEntity.member != "") {
          if (colDef.field == "member") {
            //remove and add
            t.remove('board','shared','hka_resource_' + oldValue.toString().replace(/[^A-Z0-9]/ig, ""))
            .then(function(data){
              t.set('board','shared','hka_resource_' + rowEntity.member.replace(/[^A-Z0-9]/ig, ""),rowEntity);
            });
          } else {
            //update
            t.set('board','shared','hka_resource_' + rowEntity.member.replace(/[^A-Z0-9]/ig, ""),rowEntity)
          }
        }
      }
      
      /*function getSelected() {
        var selection = vm.myGridApi.selection.getSelectedRows();
        
        if (selection.length == 0) {
            return;
        }
      }*/
      
      function addRow () {
        var newRow = { member: ""};
        for (var i = 0; i < vm.grid.columns.length; i++)
        {
          if (i > 0) { newRow[vm.grid.columns[i].field] = 0; }
        }
        
        vm.model.data.push(newRow);
      }
      function deleteRow (row) {
        t.remove('board','shared','hka_resource_' + row.entity.member.replace(/[^A-Z0-9]/ig, ""))
        //.then(function(data){
          var index = vm.GridOptions.data.indexOf(row.entity);
          vm.GridOptions.data.splice(index,1);
        //});
      }
      
      function updateSetting(settingName) {
        console.log("board.controller>updateSetting"); 
        t.set('board','shared',settingName,vm.model[settingName])
        .then(function(data){
          vm.model.timeValues = boardService.getMonthsArray(vm.model.hka_targetstart,vm.model.hka_targetfinish);
          
          vm.grid.columns = [
            {
              name: 'Delete',
              cellTemplate: '<button class="btn btn-primary" ng-click="grid.appScope.deleteRow(row)"><i class="fas fa-trash-alt"></i></button>',
              width:'80'
            },
            { name:'Resource', field: 'member',pinnedLeft:true,width:'175'}
          ];
          resetColumns();
          vm.GridOptions.columnDefs = vm.grid.columns;
          vm.myGridApi.core.notifyDataChange( uiGridConstants.dataChange.ALL );
        });
        
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
