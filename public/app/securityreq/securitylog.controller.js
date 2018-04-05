/* global angular, context, t, saveAs*/

(function () {
    'use strict';

    angular
        .module('app')
        .controller('securitylogCtrlAs', securitylogCtrlAs)

    securitylogCtrlAs.$inject = ['securitylogService', '$ocLazyLoad','$scope'];

    function securitylogCtrlAs(securitylogService, $ocLazyLoad, $scope) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Security Configuration Log';
      vm.getRegisterReport = getRegisterReport;
      vm.model = {board:{cards:[]}};
      
      vm.securityGridOptions = {
            enableSorting: true,
            enableRowSelection: false,
            enableSelectAll: false,
            selectionRowHeaderWidth: 35,
            multiSelect: false,
            showGridFooter: true,
            rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div>',
            columnDefs: [
              { name:'Card Name', field: 'name', grouping: { groupPriority: 0 } },
              { name:'id', field: 'idShort' , width:50},
              { name: 'Security Group', field: 'group'},
              { name:'Completed', field: 'complete',
                type: 'boolean',
                width: '125',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>' },
              { name:'Full Access', field: 'full',
                type: 'boolean' ,
                width: '125',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'},
              { name:'Create Records', field: 'create',
                type: 'boolean' ,
                width: '125',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'},
              { name:'Edit Records', field: 'edit',
                type: 'boolean' ,
                width: '125',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'},
              { name:'Delete Records', field: 'delete',
                type: 'boolean' ,
                width: '125',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'},
              { name:'View Only', field: 'view',
                type: 'boolean' ,
                width: '125',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'},
              { name:'No Access', field: 'noaccess',
                type: 'boolean' ,
                width: '125',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'},
              { name:'Notes', field: 'note' },
            ],
            filter: { term: 'completed' },
            data: vm.model.securityreqs
      }
      
      vm.securityGridOptions.onRegisterApi = registerGrid;
      //vm.selectionChanged = selectionChanged;
      //vm.getSelected = getSelected;
      
      activate();

      function activate() {
        console.log("riskmgmt.controller>activate");
        console.groupCollapsed("Initialize riskmgmt");

        securitylogService.init()
        .then(function (data) {
            vm.model = securitylogService.model;
            vm.context = context;
            vm.securityGridOptions.data = vm.model.securityreqs; 
            //console.dir(vm);
            console.groupEnd();  // End Initialize Console Group
        });
        $ocLazyLoad.load({
            serie: true,
            files: ['lib/FileSaver.min.js']
        });
      }
      
      function registerGrid(gridApi) {
            vm.myGridApi = gridApi;
            //vm.myGridApi.selection.on.rowSelectionChanged($scope, vm.selectionChanged);
      }
      
      function getRegisterReport() {
        var model = {
          securityreqs: vm.model.securityreqs,
          board: {
              name: vm.model.board.name
          }
        }
        securitylogService.getReport(model);
      }
    }
})();