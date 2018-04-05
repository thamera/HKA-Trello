/* global angular, t */

(function () {
    'use strict';

    angular
    .module('app')
    .constant('Schema', {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Group Name' },
        complete: { type: 'boolean', title: 'Security Updates Complete' },
        full: { type: 'boolean', title: 'Full Permissions' },
        create: { type: 'boolean', title: 'Create Records' },
        delete: { type: 'boolean', title: 'Delete Records' },
        edit: { type: 'boolean', title: 'Edit Records' },
        view: { type: 'boolean', title: 'View Only' },
        noaccess: { type: 'boolean', title: 'No Access'},
        note: { type: 'string', title: 'Notes', maxLength: 1000, validationMessage: "Maximum of 1,000 characters in the note field" }
      }
    })
    .controller('securityreqCtrlAs', securityreqCtrlAs)
    .controller('RowEditCtrl',RowEditCtrl)
    .service('RowEditor',RowEditor);

    securityreqCtrlAs.$inject = ['$scope', '$q', 'securityreqService','uiGridConstants','RowEditor'];
  
  RowEditor.$inject = ['$rootScope', '$uibModal'];
  function RowEditor($rootScope, $uibModal) {
    
    var service = {};
    service.editRow = editRow;

    function editRow(grid, row) {
      $uibModal.open({
        templateUrl: './app/securityreq/securityreq.modaltemplate.js',
        controller: ['$uibModalInstance', 'Schema', 'grid', 'row', RowEditCtrl],
        controllerAs: 'vm',
        resolve: {
          grid: function () { return grid; },
          row: function () { return row; }
        }
      }).result.then(function(result){
        //console.log("here");  
        //console.dir(result);
        result["isSecurityReq"] = true;
        return t.set('card', 'shared', 'hka_securityreq_'+ result.name, result );
      });
    }

    return service;
  }
  
  function RowEditCtrl($uibModalInstance, Schema, grid, row) {
    var vm = this;
    vm.schema = Schema;
    vm.entity = angular.copy(row.entity);
    vm.form = [{ key: 'name', readonly: true},
               'complete',
               {key: 'full', 
                 onChange: function(modelValue,form) {
                   if (modelValue == true) {
                     vm.entity.create = true;
                     vm.entity.delete = true;
                     vm.entity.edit = true;
                     vm.entity.view = true;
                     vm.entity.noaccess = false;
                   }
                 }
               },
               {key: 'create',
                onChange: function(modelValue,form) {
                   if (modelValue == true) {
                     vm.entity.view = true;
                     vm.entity.noaccess = false;
                   } else {
                     vm.entity.full = false;
                   }
                 }
               },
               {key: 'delete', 
                 onChange: function(modelValue,form) {
                   if (modelValue == true) {
                     vm.entity.view = true;
                     vm.entity.noaccess = false;
                   } else {
                     vm.entity.full = false;
                   }
                 }
               },
               {key: 'edit', 
                 onChange: function(modelValue,form) {
                   if (modelValue == true) {
                     vm.entity.view = true;
                     vm.entity.noaccess = false;
                   } else {
                     vm.entity.full = false;
                   }
                 }
               },
               {key: 'view', 
                 onChange: function(modelValue,form) {
                   if (modelValue == false) {
                     vm.entity.create = false;
                     vm.entity.delete = false;
                     vm.entity.edit = false;
                     vm.entity.full = false;
                     vm.entity.noaccess = false;
                   }
                 }
               },
               {key: 'noaccess',
                 onChange: function(modelValue,form) {
                   if (modelValue == true) {
                     vm.entity.create = false;
                     vm.entity.delete = false;
                     vm.entity.edit = false;
                     vm.entity.full = false;
                     vm.entity.view = false;
                   }
                 }
               },
               { key: 'note',
                type: 'textarea'
               }
              ];
    
    vm.save = save;
    
    function save() {
      row.entity = angular.extend(row.entity, vm.entity);
      $uibModalInstance.close(row.entity);
    }
    
  }

    function securityreqCtrlAs($scope, $q, securityreqService,uiGridConstants,RowEditor) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Security Configuration Needs';
      vm.model = {
            ready: false,
            selection: {
            },
            numberSelected: 0
      };
      $scope.editNote = RowEditor.editRow;
      $scope.clearNote = clearNote;
      
      // UI Grid (Checklist Grid)
      vm.securityreqGridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            enableSelectAll: false,
            selectionRowHeaderWidth: 35,
            multiSelect: false,
            showGridFooter: true,
            rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader  }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div>',
            columnDefs: [
              { name: "Actions",
                field: "edit",
                width: '75',
                enableFiltering: false,
                enableSorting: false,
                cellTemplate: '<div><button type="button" class="btn btn-xs btn-primary" ng-click="grid.appScope.editNote(grid, row)"><i class="fas fa-edit"></i></button>'
                             + '&nbsp;<button type="button" class="btn btn-xs btn-primary" ng-click="grid.appScope.clearNote(grid, row)"><i class="fas fa-trash-alt"></i></button>'
                             + '</div>',
                enableCellEdit: false
              },
              { name: 'name', 
                width: '150'//,
                //cellTemplate: '<div ng-if="!row.entity.editrow">{{COL_FIELD}}</div><div ng-if="row.entity.editrow"><input type="text" style="height:30px" ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'complete',
                type: 'boolean',
                width: '100',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'full',
                type: 'boolean',
                width: '75',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'create',
                type: 'boolean',
                width: '75',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'delete',
                type: 'boolean',
                width: '75',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'edit',
                type: 'boolean',
                width: '75',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'view',
                type: 'boolean',
                width: '75',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'no access',
                field: 'noaccess',
                type: 'boolean',
                width: '100',
                cellTemplate: '<div><input type="checkbox" disabled ng-model="MODEL_COL_FIELD"/></div>'
              },
              { name: 'note',
                width: '300'//,
                //cellTemplate: '<div ng-if="!row.entity.editrow">{{COL_FIELD}}</div><div ng-if="row.entity.editrow"><div class="ui-grid-cell-contents"><button type="button" class="btn btn-xs btn-primary" ng-click="grid.appScope.editNote(grid, row)"><i class="fa fa-edit">Edit</i></button></div>'
              }
            ],
            data: vm.model.securityreqData
      }
      
      vm.securityreqGridOptions.onRegisterApi = registerGrid;
      
      activate();
      
      function activate() {
        securityreqService.init()
        .then(function (data) {
          console.log("set securityreq model");
          vm.model = securityreqService.model;
          
          formatItems();

          vm.model.ready = true;
          
          // Uncomment next too lines to view data model
          //console.log("final model");
          //console.dir(vm.model);
        });
      }
      
      function formatItems() {
        // Get selected card checklists
        //console.dir(vm);
        var securityGroups = [];
        if( vm.model.board.hka_securitygroups.trim() != '') {
          securityGroups = vm.model.board.hka_securitygroups.split(',');
        }

        for (var i = 0; i < securityGroups.length; i++)  {
          var group = { name: securityGroups[i] }
          if (vm.model.cardSettings["hka_securityreq_" + group.name] != undefined){
            group["complete"] = vm.model.cardSettings["hka_securityreq_" + group.name].complete;
            group["full"] = vm.model.cardSettings["hka_securityreq_" + group.name].full;
            group["create"] = vm.model.cardSettings["hka_securityreq_" + group.name].create;
            group["edit"] = vm.model.cardSettings["hka_securityreq_" + group.name].edit;
            group["delete"] = vm.model.cardSettings["hka_securityreq_" + group.name].delete;
            group["view"] = vm.model.cardSettings["hka_securityreq_" + group.name].view;
            group["noaccess"] = vm.model.cardSettings["hka_securityreq_" + group.name].noaccess;
            group["note"] = vm.model.cardSettings["hka_securityreq_" + group.name].note;
          }
          //console.dir(group);
          vm.securityreqGridOptions.data.push(group);
        }
        
        for ( var prop in vm.model.cardSettings ) {
          //console.log(vm.securityreqGridOptions.data.filter(group => (group.name === vm.model.cardSettings[prop].name)));
          if(vm.securityreqGridOptions.data.filter(group => (group.name === vm.model.cardSettings[prop].name)).length == 0 ) {
            console.dir(vm.model.cardSettings[prop]);
            vm.securityreqGridOptions.data.push(vm.model.cardSettings[prop]);
          }
        }
      }
      
      function registerGrid(gridApi) {
            vm.myGridApi = gridApi;
            //vm.myGridApi.selection.on.rowSelectionChanged($scope, vm.selectionChanged);
      }
    }
  
  function clearNote(grid, row) {
    console.dir(row);
    delete row.entity.complete;
    delete row.entity.create;
    delete row.entity.delete;
    delete row.entity.edit;
    delete row.entity.full;
    delete row.entity.note;
    delete row.entity.view;
    delete row.entity.noaccess
    console.dir(row);
    //row.entity = angular.extend(row.entity, vm.entity);
    return t.remove('card', 'shared', 'hka_securityreq_'+ row.entity.name);
  }

})();
