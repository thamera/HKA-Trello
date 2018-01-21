/* global angular, context, t, saveAs*/

(function () {
    'use strict';

    angular
        .module('app')
        .controller('riskmgmtCtrlAs', riskmgmtCtrlAs)

    riskmgmtCtrlAs.$inject = ['riskmgmtService', '$ocLazyLoad','$scope'];

    function riskmgmtCtrlAs(riskmgmtService, $ocLazyLoad, $scope) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Risk Register';
      vm.getRegisterReport = getRegisterReport;
      vm.model = {board:{cards:[]}};
      
      vm.checklistGridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            multiSelect: true,
            showGridFooter: true,
            rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'ui-grid-disabled\': row.entity.isExported  }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div>',
            columnDefs: [
              { name:'riskStatus', field: 'hka_riskStatus', grouping: { groupPriority: 0 } },
              { name:'id', field: 'idShort' , width:50},
              { name:'LastActivity', field: 'dateLastActivity' },
              { name:'Category', field: 'hka_riskCategory' },
              { name:'Description', field: 'desc' },
              { name:'Probability', field: 'hka_riskProbability' },
              { name:'Impact', field: 'hka_riskImpact' },
              { name:'Response', field: 'hka_riskResponse' },
              { name:'ScheduleImpace', field: 'hka_riskImpactSchedule' },
              { name:'CostImpact', field: 'hka_riskImpactCost' }
            ],
            filter: { term: 'hka_riskStatus' },
            isRowSelectable: function (row) {
                var name = "";
                name += row.entity.name;
                if (row.entity.isExported) {
                    return false;
                } else {
                    return true;
                }
            },
            data: vm.model.board.cards
      }
      
      vm.checklistGridOptions.onRegisterApi = registerGrid;
      vm.selectionChanged = selectionChanged;
      vm.getSelected = getSelected;
      
      activate();

      function activate() {
        console.log("riskmgmt.controller>activate");
        console.groupCollapsed("Initialize riskmgmt");

        riskmgmtService.init()
        .then(function (data) {
            vm.model = riskmgmtService.model;
            vm.context = context;
            vm.checklistGridOptions.data = $.grep(vm.model.board.cards, function(card) { return card.hka_riskStatus != undefined && card.hka_riskStatus.indexOf('Active') != -1 ; });
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
            vm.myGridApi.selection.on.rowSelectionChanged($scope, vm.selectionChanged);
      }
      
      function selectionChanged(rowChanged) {

        }
      
      function getSelected() {
        var selection = vm.myGridApi.selection.getSelectedRows();
        
        if (selection.length == 0) {
            //alert("please select the checklist items to be converted to cards.  Selected items will have a check mark to the left.");
            return;
        }
      }
      
      function getRegisterReport() {
        var model = {
          risks: $.grep(vm.model.board.cards, function(card) { return card.hka_riskStatus != undefined && card.hka_riskStatus.indexOf('Active') != -1 ; }),
          board: {
              name: vm.model.board.name
          }
        }
        riskmgmtService.getReport(model);
      }
    }
})();