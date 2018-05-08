/* global angular, t */

(function () {
    'use strict';

  angular
    .module('app')
    .controller('checklistCtrlAs', checklistCtrlAs)
    .directive('uiSelectWrap', uiSelectWrap)
    .filter('mapName', mapName)

    checklistCtrlAs.$inject = ['$scope', '$q', 'checklistService'];

    function checklistCtrlAs($scope, $q, checklistService) {
      /* jshint validthis:true */
      var vm = this;
      vm.title = 'Checklists To Cards';
      vm.model = {
        ready: false,
        selection: {
            toList: {},
            card: {}
        },
        numberSelected: 0,
      };
      
      
      vm.grid = {
        columns: [
          { name: 'name', enableCellEdit: false },
          { name: 'checklist', grouping: { groupPriority: 0 }, enableCellEdit: false },
          { name: 'TargetList', displayName: 'Target List', cellFilter: 'mapName',
           editableCellTemplate: 'uiSelect', editDropdownValueLabel: 'name',
           editDropdownOptionsArray: []
          },
          { name: 'Labels', cellFilter: 'mapName', editableCellTemplate: 'uiSelectMulti',
            editDropdownValueLabel: 'name', editDropdownOptionsArray: []
          },
          { name: 'Members', cellFilter: 'mapName', editableCellTemplate: 'uiSelectMembers',
            editDropdownValueLabel: 'fullName', editDropdownOptionsArray: []
          },
          { name: 'due', displayName: 'Due Date', type: 'date',cellFilter:'date:"yyyy-MM-dd"' }
        ]
      }
      vm.promiseIndex = '';
      vm.promiseMsg = 'Proceed';
      
      // UI Grid (Checklist Grid)
      vm.checklistGridOptions = {
            enableSorting: true,
            enableRowSelection: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            multiSelect: true,
            //enableCellEditOnFocus: true,
            showGridFooter: true,
            rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'ui-grid-disabled\': row.entity.isExported  }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div>',
            columnDefs: vm.grid.columns,
            isRowSelectable: function (row) {
                var name = "";
                name += row.entity.name;
                if (row.entity.isExported) {
                    return false;
                } else {
                    return true;
                }
            },
            data: vm.model.checklistData
      }
      
      vm.checklistGridOptions.onRegisterApi = registerGrid;
      vm.selectionChanged = selectionChanged;
      vm.getSelected = getSelected;
      
      activate();
      
      function activate() {
        checklistService.init()
        .then(function (data) {
          console.log("set ctrl model");
          vm.model = checklistService.model;
          
          formatChecklists();
          
          console.dir(vm.model.board);
          vm.checklistGridOptions.columnDefs[2].editDropdownOptionsArray = vm.model.board.lists;
          vm.checklistGridOptions.columnDefs[3].editDropdownOptionsArray = vm.model.board.labels;
          vm.checklistGridOptions.columnDefs[4].editDropdownOptionsArray = vm.model.board.members;
          
          vm.model.ready = true;
          
          // Uncomment next too lines to view data model
          //console.log("final model");
          //console.dir(vm.model);
        });
      }
      
      function formatChecklists() {
        // Get selected card checklists
          for (var i = 0; i < vm.model.board.cards.length; i++) {
            if ( vm.model.board.cards[i].id == vm.model.selectedCard.id ) {
              for (var j = 0; j < vm.model.board.cards[i].checklists.length; j++) {
                var checklist = vm.model.board.cards[i].checklists[j].checkItems;
                for (var k = 0; k < checklist.length; k++) {
                  checklist[k].checklistId = vm.model.board.cards[i].checklists[j].id;
                  checklist[k].checklist = vm.model.board.cards[i].checklists[j].name;
                  checklist[k].isExported = false;
                  
                  if ($.grep(vm.model.board.cards, function(card) { return card.hka_fromChecklistId == checklist[k].id; }).length > 0) {
                    checklist[k].isExported = true;
                  }
                  
                  vm.checklistGridOptions.data.push(checklist[k]);
                  
                }
              }
           }
          }
      }
      
      function registerGrid(gridApi) {
            vm.myGridApi = gridApi;
            vm.myGridApi.selection.on.rowSelectionChanged($scope, vm.selectionChanged);
      }
      
      function selectionChanged(rowChanged) {
            if (!vm.myGridApi.selection.getSelectedRows().length) { vm.model.numberSelected = 0; }
            else {
                vm.model.numberSelected = vm.myGridApi.selection.getSelectedRows().length;
            }
        }
      
      function getSelected() {
        var selection = vm.myGridApi.selection.getSelectedRows();
        
        /*  // Make sure everything is ready
        if (!vm.model.selection.tolist || vm.model.selection.tolist == "") {
            alert("A list had not been identified to send new checlist cards to.  Please select a list and try again.");
            return;
        } */
        for (var j = 0; j < selection.length; j++) {
           if(!selection[j].TargetList || !selection[j].TargetList.id ) {
             alert("All selected items must have a target list defined to continue.  Either deselect items without target lists or select the appropriate list for each checklist being converted.");
             return;
           };
        };
        if (selection.length == 0) {
            alert("please select the checklist items to be converted to cards.  Selected items will have a check mark to the left.");
            return;
        };
        
        vm.promiseIndex = selection.length;
        vm.promiseMsg = 'Processing... ';
        var cardChain = $q.when();
        
        for (var i = 0; i < selection.length; i++) {
          // Create Cards
          vm.model.ready = false;
          var list = $.grep(vm.model.board.lists, function (list) { return list.id == vm.model.selectedCard.idList })[0];
          var newCard = {
            //name: selection[i].name,
            //desc: "",
            //idList: vm.model.selection.tolist,
            //labels: vm.model.selectedCard.idLabels.join(),
            fromCardId: vm.model.selectedCard.id,
            fromCard: vm.model.selectedCard.name,
            fromChecklistId: selection[i].id,
            fromChecklist: selection[i].name,
            fromURL: vm.model.selectedCard.url,
            shortLink: vm.model.selectedCard.shortLink,
            fromChecklistCollection: selection[i].checklistId,
            cardData: selection[i]
          };
          //console.dir(newCard);
          (function(index,newCard1) {
            cardChain = cardChain.then(function() {
              //console.log("Attempt " + index);
              return checklistService.createCard(newCard1,index,selection.length)
                .then(function(newCardId){
                  console.log('checklist.service>creating plugin properties for new card...');
                  console.log(newCardId);
                  t.set(newCardId,'shared',{ hka_fromCardId: newCard1.fromCardId,hka_fromCard: newCard1.fromCard, hka_fromChecklistId: newCard1.fromChecklistId, hka_fromChecklist: newCard1.fromChecklist});
                  vm.promiseIndex--;
              });
            });
          })(i,newCard);
        }
        cardChain.then(function(){
          finishChecklistCreation(selection.length); 
        });
      }
      
      function finishChecklistCreation(count) {
            vm.myGridApi.selection.clearSelectedRows();
            vm.checklistGridOptions.data.length = 0;
            activate();
            alert("HKA Trello App successfully created " + count + " cards from checklists.  You're welcome.");
          vm.promiseMsg = 'Proceed';
          vm.promiseIndex = '';
        }

    }
  
  uiSelectWrap.$inject = ['$document', 'uiGridEditConstants'];
  function uiSelectWrap($document, uiGridEditConstants) {
    return function link($scope, $elm, $attr) {
      $document.on('click', docClick);

      function docClick(evt) {
        if ($(evt.target).closest('.ui-select-container').size() === 0) {
          $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
          $document.off('click', docClick);
        }
      }
    };
  }
  
  function mapName() {
    return function(input) {
      //console.dir(input);
      if(input == undefined) {return ""; }
      if(Array.isArray(input)) {
        if (input.length == 0) {return "";}
        if(input[0].fullName) { return input.map(e => e.fullName).join(","); }
        return input.map(e => e.name).join(",");
      }
      return input.name ;
    }
  }
})();
