/* global angular,t,context */

(function () {
    'use strict';

    angular
        .module('app')
        .controller('boardCtrlAs', boardCtrlAs)
        .directive('liveValidation',liveValidation)
        .directive('liveValidator',liveValidator);

    boardCtrlAs.$inject = ['$scope','boardService','uiGridConstants','uiGridValidateService','$window'];
    liveValidation.$inject = ['$compile', '$templateCache'];
    liveValidator.$inject = ['uiGridValidateService'];

    function boardCtrlAs($scope,boardService,uiGridConstants,uiGridValidateService,$window) {
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
        enableCellEditOnFocus: true,
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
          //console.dir(vm.model);
          resetColumns();
          
          vm.GridOptions.data = vm.model.data;
        });
      }
      
      function registerGrid(gridApi) {
        vm.myGridApi = gridApi;
        //vm.myGridApi.selection.on.rowSelectionChanged($scope, vm.selectionChanged);
        vm.myGridApi.edit.on.afterCellEdit($scope, rowEdited);
        vm.myGridApi.validate.on.validationFailed($scope,function(rowEntity, colDef, newValue, oldValue){
          //console.dir(colDef);
          $window.alert('Resource: '+ rowEntity.member + '\n' +
            'Column: ' + colDef.name + '\n' +
            'New Value: ' + newValue + '\n' +
            'Old Value: ' + oldValue);
        });
      }
      
      function selectionChanged(rowChanged) {

      }
      
      function rowEdited(rowEntity, colDef, newValue, oldValue) {       
        if(colDef.validators.WeeklyHours && (newValue < 0 || newValue > 40 )) return;
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
        console.log("board.controller>resetColumns");
        if (vm.model.timeValues) {
          for (var c = 0; c < vm.model.timeValues.length; c++) {
            vm.grid.columns.push({ name: vm.model.timeValues[c]
                                  ,field: vm.model.timeValues[c]
                                  ,type: 'number',
                                  width: '90',
                                  validators: {'WeeklyHours': true}
                                  , cellTemplate: 'ui-grid/cellTitleValidator'
                                 } );
          }
        }
      }

      uiGridValidateService.setValidator('WeeklyHours',
        function(argument) {
          return function(oldValue, newValue, rowEntity, colDef) {
            if (!newValue) {
              return true; // We should not test for existence here
            } else {
              if (newValue >= 0 && newValue <= 40) return true;
            }
          };
        },
        function(argument) {
          return 'The value must be bewteen 0 and 40.  Each cell is entered as an estimate of hours for a typical week within the target month.';
        }
      );
      
    }

    function liveValidation($compile, $templateCache){
      return {
        restrict: 'A',
        priority: -200,
        controllerAs: 'liveValidationCtrl',
        require: 'uiGrid',
        link: function(scope, element, attr, uiGridCtrl){
          function addValidator(str){
            return str.replace('<input', '<input live-validator');
          }
          
          var formElement = $compile(angular.element('<ngForm name="' + attr.uiGrid + '.validations.gridForm"></ngForm>'))(scope);
          element.append(formElement);
          
          // edit the default template
          $templateCache.put('ui-grid/cellEditor', addValidator($templateCache.get('ui-grid/cellEditor')));
            
          // change the custom edit templates if any - might need to take special care with "select" etc. which might actually have their own logics (in the case of croos-grid validation - e.g. can't choose the same value twice)
          angular.forEach(uiGridCtrl.grid.options.columnDefs, function(column){
            if (angular.isDefined(column.editableCellTemplate) && column.editableCellTemplate.indexOf('input') > -1){
              column.editableCellTemplate = addValidator(column.editableCellTemplate);
            }
          })
        }
      }
    };

    function liveValidator(uiGridValidateService){
      return {
        restrict: 'A',
        controllerAs: 'liveValidatorCtrl',
        require: 'ngModel',
        controller: function(){
          
        },
        link: function($scope, $element, $attr, ngModel){
          // this method would track the change in the input's value and do the validation for it
          function validationParser(viewValue){
            var grid = $scope.grid;
            var row = $scope.row;
            var col = $scope.col;
            var service = uiGridValidateService;
            console.log(oldValue);
            
            service.runValidators(row.entity, col.colDef, viewValue, oldValue, grid);
            setTimeout(function(){
              var invalid = service.isInvalid(row.entity, col.colDef);
              // TODO::get what failed or passed - what validator?
              //grid.options.validations.gridForm.$setValidity(row.entity.$$hashkey + '_' + col.name + '_' + 'whatDidntPass', invalid);
              invalid?cellElement.addClass('error'):cellElement.removeClass('error');
              
            }, 250);
            
            return viewValue;
          }
          
          function keepOldValue(viewValue){
            oldValue = viewValue;
            return viewValue;
          }
          
          var oldValue;
          var check = false;
          var cellElement = $element;
          while (!check){
            cellElement = cellElement.parent();
            if (cellElement.hasClass('ui-grid-cell')){
              check = true;
            }
          }
          //TODO::probably need to do something in element.on('$destroy').
          // Like nullify some vars and remove the error (since this is handled by the validator itself)
          ngModel.$parsers.push(validationParser);
          ngModel.$formatters.push(keepOldValue);
        }
      }
    }

})();
