define(["angular"], function(angular) {
  var ciscosbcs = angular.module("cisco.smb.components", []);

  // order data for regular table
  ciscosbcs.filter("orderTable",function(){
    return function(input, itemArrIndex, reverseOrder){
      var type = typeof itemArrIndex;
      if(type === "undefined") return;
      if(type === "number"){
        if(typeof input[1][itemArrIndex].text === "string"){
          input.sort(compareString);
        }
        if(typeof input[1][itemArrIndex].text === "number"){
          input.sort(compareNumber);
        }
      }
      function compareNumber(x,y){
        var diff = x[itemArrIndex].text - y[itemArrIndex].text;
        if (reverseOrder) {
          if(diff > 0) return 1;
          if(diff < 0) return -1;
          if(diff === 0) return 0;
        }else{
          if(diff > 0) return -1;
          if(diff < 0) return 1;
          if(diff === 0) return 0;
        }
      }
      function compareString(x,y){
        if(reverseOrder){
          if(x[itemArrIndex].text > y[itemArrIndex].text) return 1;
          if(x[itemArrIndex].text < y[itemArrIndex].text) return -1;
          if(x[itemArrIndex].text === y[itemArrIndex].text) return 0;
        }else{
          if(x[itemArrIndex].text > y[itemArrIndex].text) return -1;
          if(x[itemArrIndex].text < y[itemArrIndex].text) return 1;
          if(x[itemArrIndex].text === y[itemArrIndex].text) return 0;
        }
      }

      return input;
    }
  });

  // order data for complex table
  ciscosbcs.filter("orderComplexTable",function(){
    return function(input, title, reverseOrder){
      var type = typeof title;
      if(type === "undefined" || title === "" || !input.length) return;
      var _text_;
      for(var i = 0; i < input[0].trunk.length; i++){
        if(input[0].trunk[i].title === title){
          _text_ = input[0].trunk[i].text;
          break;
        }
      }
      if(typeof _text_=== "string"){
        input.sort(compareString);
      }
      if(typeof _text_ === "number"){
        input.sort(compareNumber);
      }
      function compareNumber(x,y){
        var diff = getText(x,title) - getText(y,title);
        if (reverseOrder) {
          if(diff > 0) return 1;
          if(diff < 0) return -1;
          if(diff === 0) return 0;
        }else{
          if(diff > 0) return -1;
          if(diff < 0) return 1;
          if(diff === 0) return 0;
        }
      }
      function compareString(x,y){
        var _x_ = getText(x,title);
        var _y_ = getText(y,title);
        if(reverseOrder){
          if(_x_ > _y_) return 1;
          if(_x_ < _y_) return -1;
          if(_x_ === _y_) return 0;
        }else{
          if(_x_ > _y_) return -1;
          if(_x_ < _y_) return 1;
          if(_x_ === _y_) return 0;
        }
      }
      function getText(dataItem,title){
        for(var i = 0; i < dataItem.trunk.length; i++){
          if(dataItem.trunk[i].title === title){
            return dataItem.trunk[i].text;
          }
        }
      }

      return input;
    }
  });

  ciscosbcs.directive('finished', ["$timeout", function($timeout) {
    return {
      restrict: 'A',
      link: function($scope, ele, attr) {
        if ($scope.$last) {
          $timeout(function() {
            $scope.$emit("repeat_finished_msg");
          });
        }
      }
    }
  }]);

  ciscosbcs.directive('syncDirective', ["$timeout", function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $ele, $attrs) {
            function setDataStyle(){
            removeClassForTable();
            var trStyleDM = $scope.regularTableDataModel.event.setTrStyle;
            var tdStyleDM = $scope.regularTableDataModel.event.setTdStyle;
            $timeout(function(){
              $($ele).find("tbody tr").each(function(index,element){
                if (typeof $scope.tableDM[index] === "number" || $scope.tableDM[index] === undefined) return;
                for(var i =0; i < trStyleDM.length; i++){
                  if(trStyleDM[i].filter(element,$scope.tableDM[index])){
                    $(element).addClass(trStyleDM[i].style);
                  }
                }
                $(element).find("td").each(function(index0,element0){
                  for(var j = 0; j < tdStyleDM.length; j++){
                    if(tdStyleDM[j].filter(element0,$scope.tableDM[index]) && tdStyleDM[j].key === $scope.tableTitleDM[index0].name){
                      $(element0).addClass(tdStyleDM[j].style);
                    }
                  }
                });
              });
            });
          }
          setDataStyle();
          function removeClassForTable(){
            var trStyleDM = $scope.regularTableDataModel.event.setTrStyle;
            var tdStyleDM = $scope.regularTableDataModel.event.setTdStyle;
            for(var i =0; i < trStyleDM.length; i++){
              $($ele).find("tbody tr").removeClass(trStyleDM[i].style);
            }
            for(var j = 0; j < tdStyleDM.length; j++){
              $($ele).find("td").removeClass(tdStyleDM[j].style);
            }
          }
        }
    };
  }]);

  ciscosbcs.directive('chooseTableCol', ["$timeout", function($timeout) {
    return {
        restrict: 'E',
        replace:true,
        scope:{
          checkBoxItems:"=",
          tableTitle:"="
        },
        template:'<div class ="ciscosb-col-selector" ng-click="clickCntr($event)">'
          +'<div class ="ciscosb-col-selector-arrow"></div>'
          +'<div class="ciscosb-col-selector-content-cntr">'
            +'<table class="ciscosb-col-table">'
              +'<tr ng-repeat="itemObj in dm">'
                +'<td ng-repeat = "item in itemObj" class="ciscosb-col-table-td">'
                  +'<smb-checkbox ng-model="item.checked" ng-click="chooseCol(item)">{{item.name}}</smb-checkbox>'
                +'</td>'
              +'</tr>'
            +'</table>'
          +'</div>'
        +'</div>',

        link: function($scope, $ele, $attrs,controller) {
          if(!FIC.isArray($scope.checkBoxItems)) return;
          $scope.clickCntr = function(e){
            FIC.stopBubble(e);
          };

          $scope.dm = [];
          var reOrgDm = function(checkBoxItems){
            var tempArr = [];
            if(angular.isArray(checkBoxItems)){
              if (!checkBoxItems.length) return;
              if(checkBoxItems[0].hasOwnProperty("trunk")){
                tempArr = checkBoxItems[0].trunk;
              }
            }
            var resultSet = [], item = [], index = 0;
            for(var i = 0; i < tempArr.length; i++){
              console.log(tempArr[i].isVisible +"OO"+tempArr[i].name);
              if(tempArr[i].hasOwnProperty("isVisible") && tempArr[i].isVisible && tempArr[i].name){
                index += 1;
                var tempObj = {};
                tempObj.name = tempArr[i].title;
                tempObj.checked = true;
                if(index === 0){
                  item.push(tempObj);
                  continue;
                }
                if((index)%3 !== 0){
                  item.push(tempObj);
                }else{
                  item.push(tempObj);
                  resultSet.push(item);
                  item = [];
                }
              }
            }
            if(item.length) resultSet.push(item);
            $scope.dm = resultSet;
          };

          var flag = false;
          $scope.$watch("checkBoxItems",function(newVal,oldVal){
            if(angular.isArray(oldVal)){
              if(!oldVal.length) reOrgDm($scope.checkBoxItems);
            }
            
          });

          //reOrgDm($scope.checkBoxItems);

          $scope.chooseCol = function(item){
            for(var i = 0; i < $scope.checkBoxItems.length; i++){
              for(var j = 0; j < $scope.checkBoxItems[i].trunk.length; j++){
                if($scope.checkBoxItems[i].trunk[j].title === item.name){
                  item.checked ? $scope.checkBoxItems[i].trunk[j].isVisible = true 
                                      : $scope.checkBoxItems[i].trunk[j].isVisible = false;
                }
              }
            }
            for(var i = 0; i < $scope.tableTitle.length; i++){
              if($scope.tableTitle[i].value === item.name){
                item.checked ? $scope.tableTitle[i].isVisible = true
                                    : $scope.tableTitle[i].isVisible = false;
              }
            }
          };

        } // end of link function.
    };
  }]);

  // regular table.
  // 1.column.required.name—>key value. Title—>table title.
  // 2.hasRadioBtn.if we have this field then we get a radio button for each row.
  // 3.hasCheckBox. If we have this field then we get a checkbox for each row.
  // 4.tableBodyHeight: define the body height of a table. unit:px.
  // 5.event.
  //    setTrStyle:type(array). Each object in this array means you can define a rule for table row styles.
  //    setTdStyle:type(array). Each object in this array means you can define a rule for table grid.
  //    Style filed—> the css style you can customize.
  //    Filter filed—> the rule you can customize.
  // 6.getRow. You can get the data item which you have selected by a radio button or checkBox.(checkBox haven’t supported yet!!!)
  ciscosbcs.directive('regularTable', ["$filter","$timeout", function($filter, $timeout) {
    return {
      restrict: 'E',
        replace: true,
        scope: {
          regularTableDataModel:"="
        },
        template: '<div class="ciscosb-complex-table-cntr">'
          +'<table class="ciscosb-table">'
            +'<thead>'
              +'<tr>'
                +'<th ng-repeat="tbTitle in tableTitleDM track by $index" ng-click="sortData(tbTitle)" ng-class="setRegularTdStyle(tbTitle)">{{tbTitle.value}}'
                  +'<i class="fa" ng-class="setOrderIconStyle(tbTitle)"></i>'
                +'</th>'
              +'</tr>'
            +'</thead>'
            +'<tbody>'
              +'<tr ng-repeat="rowItem in newswitchData" finished ng-mousedown="trMouseDown($event, $index)" ng-mousemove="trMouseMove($event,$index)" ng-mouseup="trMouseUp($event,$index)">'
                +'<td ng-repeat="dataItem in rowItem" ng-class="setRegularTdStyle(dataItem)">'
                +'{{dataItem.text}}'
                  +'<smb-radio ng-if="dataItem.tdType === '+'radioBtn'+'" name="rb"  ng-click="selectOneRow(rowItem,selectRowStatus)"></smb-radio>'
                +'</td>'
              +'</tr>'
            +'</tbody>'
          +'</table>'
          +'<div ng-show="isPaginationDis">'
            +'<tm-pagination conf="conf" data="tableDM" tm-data="tmData" ng-model="newswitchData" ng-click="paginationClick($event)" ng-mouseup="paginationMouseup($event)"></tm-pagination>'
          +'</div>'
          
          +'<div id="rowMovePosition" ng-mouseup = "trMouseUp($event)" style="height:6px; border-top:1px solid black; border-bottom: 1px solid black; position: absolute; width: 100%;top:0; display: none;"></div>'
        +'</div>',
        controller:function($scope,$element,$transclude){
          // pagination
          $scope.conf = {
            currentPage: 1,
            itemsPerPage: 5,
            pagesLength: 5,
            perPageOptions: [5, 10],
            pageTotalPos: 300
          };
          $scope.paginationClick = function(ev) {
            FIC.stopBubble(ev);
          };

          $scope.paginationMouseup = function(ev) {
            FIC.stopBubble(ev);
          };

        },
        link:function($scope, $ele, $attrs){

          $scope.isPaginationDis = true;
          //pagination visibility.
          if($attrs.hasOwnProperty("haspagination")){
            if($attrs.haspagination === "false"){
              $scope.isPaginationDis = false;
              $scope.conf.itemsPerPage = 10000000000;
            }
          }

          if(!$scope.hasOwnProperty("regularTableDataModel")){
            console.error("The data model from regular table is not available. Please check your data model name.");
            return;
          }

          function setHeaderData(column){
            var tempColumnTitle = [];
            for(var i = 0; i < column.length; i++){
              var tempObj = {};
              var uniqueId = getId();
              if(column[i].hasOwnProperty("title")){
                tempObj.value = column[i].title;
              }else{
                tempObj.value = column[i].name;
              }
              tempObj.name = column[i].name;
              tempObj.orderDefaultFlag = true;
              tempObj.ascFlag = false;
              tempObj.descFlag = false;
              tempObj.itemIndex = i;
              tempObj.uniqueId = uniqueId;
              tempObj.tdType = "normal";
              tempObj.checked = false;
              tempColumnTitle.push(tempObj);
            }

            if($scope.regularTableDataModel.hasOwnProperty("hasRadioBtn") && $scope.regularTableDataModel.hasOwnProperty("hasCheckBox")){
              console.warn("Set radio button and checkbox in one table is not allowed.");
            }else if($scope.regularTableDataModel.hasOwnProperty("hasRadioBtn")){
              if($scope.regularTableDataModel.hasRadioBtn){
                tempColumnTitle.unshift({tdType:"radioBtn",value:"",uniqueId:uniqueId,orderDefaultFlag:false,ascFlag:false,descFlag:false,checked:false});
              }
            }else if($scope.regularTableDataModel.hasOwnProperty("hasCheckBox")){
              if($scope.regularTableDataModel.hasCheckBox){
                tempColumnTitle.unshift({tdType:"checkBox",value:"",uniqueId:uniqueId,orderDefaultFlag:false,ascFlag:false,descFlag:false,checked:false});
              }
            }

            return tempColumnTitle;
          }

          if($scope.regularTableDataModel.hasOwnProperty("column")){
            $scope.tableTitleDM = setHeaderData($scope.regularTableDataModel.column);
          }

          function getId(){
            return Math.round(Math.random() * 10000, 10000) + "" + Math.round(Math.random() * 10000, 10000) + Math.round(Math.random() * 10000, 10000);
          }

          function setTableData(column, tableData){
          
            var tempArr = [];
            for(var j = 0; j < tableData.length; j++){
              var tempItemArr = [];
              var uniqueId = getId();
              for(var i = 0; i < column.length; i++){
                for(var key in tableData[j]){
                  if(key === column[i].name){
                    var tempObj = {};
                    tempObj.text = tableData[j][key];
                    tempObj.tdType = "normal";
                    tempObj.name = column[i].name;
                    tempObj.title = column[i].title;
                    tempObj.uniqueId = uniqueId;
                    tempObj.checked = false;
                    tempItemArr.push(tempObj);
                    break;
                  }
                }
              }

              if($scope.regularTableDataModel.hasOwnProperty("hasRadioBtn") && $scope.regularTableDataModel.hasOwnProperty("hasCheckBox")){
                console.warn("Set radio button and checkbox in one table is not allowed.");
              }else if($scope.regularTableDataModel.hasOwnProperty("hasRadioBtn")){
                if($scope.regularTableDataModel.hasRadioBtn){
                  tempItemArr.unshift({tdType:"radioBtn",text:"",uniqueId:uniqueId,title:"",name:"",checked:false});
                }
              }else if($scope.regularTableDataModel.hasOwnProperty("hasCheckBox")){
                if($scope.regularTableDataModel.hasCheckBox){
                  tempItemArr.unshift({tdType:"checkBox",text:"",uniqueId:uniqueId,title:"",name:"",checked:false});
                }
              }
                
              tempArr.push(tempItemArr);
            }
            return tempArr;

          } // end of function.

          $scope.$watch("regularTableDataModel",function(){
            $scope.tableDM = setTableData($scope.regularTableDataModel.column, 
                                                                        $scope.regularTableDataModel.tableData);
            $timeout(function(){
              if($scope.regularTableDataModel.hasOwnProperty("tableBodyHeight")){
                $ele.find("tbody").css("height",$scope.regularTableDataModel.tableBodyHeight+"px");
              }
            },100);
          },true);

          $scope.$on("regularTable_msg",function(){
            $scope.tableDM = setTableData($scope.regularTableDataModel.column, 
                                                                        $scope.regularTableDataModel.tableData);
          });

          $scope.selectRowStatus = {flag:true};
          $scope.selectOneRow = function(dataItem,selectRowStatus){
            console.log("selectRowStatus before -->" + selectRowStatus.flag);
            if($scope.regularTableDataModel.hasOwnProperty("event")){
              if($scope.regularTableDataModel.event.hasOwnProperty("getRow")){
                $scope.regularTableDataModel.event.getRow(dataItem,selectRowStatus);
              }
            }
           
            console.log("selectRowStatus after -->" + selectRowStatus.flag);
            $scope.selectRowStatus.flag = true;
          }

          $scope.originalTableDM = angular.copy($scope.tableDM);

          $scope.setRegularTdStyle = function(dataItem){
            if(dataItem.tdType === "radioBtn" || dataItem.tdType === "checkBox"){
              return {"ciscosb-table-action-col":true};
            }
          };

          if($attrs.hasOwnProperty("sort")){
            if($attrs.sort === "false"){
              for(var i = 0; i < $scope.tableTitleDM.length; i++){
                $scope.tableTitleDM[i].orderDefaultFlag = false;
                $scope.tableTitleDM[i].ascFlag = false;
                $scope.tableTitleDM[i].descFlag = false;
              }
            }
          }
          
          var orderBy = $filter("orderTable");
          $scope.sortData = function(dataItem){
            if($attrs.hasOwnProperty("sort")){
              if($attrs.sort === "false") return;
            }
            if(!dataItem.value) return;
            reSetFlag(dataItem, $scope.tableTitleDM);
            $scope.tableDM = orderBy($scope.tableDM, dataItem.itemIndex+1, getTrue(dataItem));
            setDataStyle();
          };

          $scope.setOrderIconStyle = function(dataItem){
            if(dataItem.orderDefaultFlag) return {"fa-sort":true};
            if(dataItem.ascFlag) return {"fa-sort-asc":true};
            if(dataItem.descFlag) return {"fa-sort-desc":true};
          };

          function reSetFlag(dataItem, tableTitleDM){
            for(var i = 0; i < tableTitleDM.length; i++){
              if(tableTitleDM[i].name === dataItem.name){
                if(tableTitleDM[i].orderDefaultFlag){
                  tableTitleDM[i].orderDefaultFlag = false;
                  tableTitleDM[i].ascFlag = true;
                  tableTitleDM[i].descFlag = false;
                }else{
                  tableTitleDM[i].orderDefaultFlag = false;
                  tableTitleDM[i].ascFlag ? tableTitleDM[i].ascFlag = false : tableTitleDM[i].ascFlag = true;
                  tableTitleDM[i].descFlag ? tableTitleDM[i].descFlag = false : tableTitleDM[i].descFlag = true;
                }
              }else{
                tableTitleDM[i].orderDefaultFlag = true;
                tableTitleDM[i].ascFlag = false;
                tableTitleDM[i].descFlag = false;
              }
              if(tableTitleDM[i].tdType !== "normal"){
                tableTitleDM[i].orderDefaultFlag =  tableTitleDM[i].ascFlag = tableTitleDM[i].descFlag = false;
              }
            }
          }

          function getTrue(dataItem){
            if(dataItem.ascFlag) return true;
            if(dataItem.descFlag) return false;
          }

          $scope.$on("repeat_finished_msg", function(){
            setDataStyle();
          });

          // $scope.$watch("tableDM",function(oldval,newval){
          //   if(oldval.length === newval.length){
          //     setDataStyle();
          //   }
          // },true);

          // Trigger when number of children changes,
          // including by directives like ng-repeat
          // var watch = $scope.$watch(function() {
          //     return $($ele).children().length;
          // }, function() {
          //     // Wait for templates to render
          //     $scope.$evalAsync(function() {
          //         // Finally, directives are evaluated
          //         // and templates are renderer here
          //         // var children = $($ele).children();
          //         // console.log(children);
          //         alert();
          //     });
          // });

          function setDataStyle(){
            removeClassForTable();
            if(!$scope.regularTableDataModel.hasOwnProperty("event")) return;
            if(!$scope.regularTableDataModel.event.hasOwnProperty("setTrStyle")) return;
            if(!$scope.regularTableDataModel.event.hasOwnProperty("setTdStyle")) return;
            var trStyleDM = $scope.regularTableDataModel.event.setTrStyle;
            var tdStyleDM = $scope.regularTableDataModel.event.setTdStyle;
            $timeout(function(){
              $($ele).find("tbody tr").each(function(index,element){
                if (typeof $scope.newswitchData[index] === "number" || $scope.newswitchData[index] === undefined) return;
                for(var i =0; i < trStyleDM.length; i++){
                  if(trStyleDM[i].filter(element,$scope.newswitchData[index])){
                    $(element).addClass(trStyleDM[i].style);
                  }
                }
                $(element).find("td").each(function(index0,element0){
                  for(var j = 0; j < tdStyleDM.length; j++){
                    if(tdStyleDM[j].filter(element0,$scope.newswitchData[index]) && tdStyleDM[j].key === $scope.tableTitleDM[index0].name){
                      $(element0).addClass(tdStyleDM[j].style);
                    }
                  }
                });
              });
            },40);
          }

          function removeClassForTable(){
            var trStyleDM = $scope.regularTableDataModel.event.setTrStyle;
            var tdStyleDM = $scope.regularTableDataModel.event.setTdStyle;
            for(var i =0; i < trStyleDM.length; i++){
              $($ele).find("tbody tr").removeClass(trStyleDM[i].style);
            }
            for(var j = 0; j < tdStyleDM.length; j++){
              $($ele).find("td").removeClass(tdStyleDM[j].style);
            }
          }

          var rowMovingFlag = false;
          var startIndex = -1;
          var endIndex = -1;
          var indexDiff = 0;
          var oldDM = [];
          var newDM = [];
          var startTrDom = null;
          var endTrDom = null;
          var userSelect = FIC.getStyleName("user-select");

          $scope.trMouseDown = function(e,index){
            rowMovingFlag = true;
            startIndex = index;
            oldDM = angular.copy($scope.tableDM);

            var curTag = e.target.tagName.toLowerCase();
            if(curTag === "tr") startTrDom = $(e.target);
            if(curTag === "td") startTrDom = $(e.target).parent();
            
            FIC.initEventsWhenStartDrag(userSelect);
          };

          
          $scope.trMouseMove = function(e,index){
            if(rowMovingFlag){
              var tablePos = FIC.getPosInViewPort($($ele).find(".ciscosb-table").get(0));
              var curTag = e.target.tagName.toLowerCase();
              if(curTag === "tr" || curTag === "td"){
                if(curTag === "tr") $(e.target).addClass("ciscosb-mouse-moving");
                if(curTag === "td") $(e.target).parent().addClass("ciscosb-mouse-moving");
                if(index === startIndex){
                  if(curTag === "tr") $(e.target).addClass("ciscosb-moving-row");
                  if(curTag === "td") $(e.target).parent().addClass("ciscosb-moving-row");
                }
                $($ele).find("#rowMovePosition").css("display","block");
                var trPos = null;
                if(curTag === "tr") trPos = FIC.getPosInViewPort(e.target);
                if(curTag === "td") trPos = FIC.getPosInViewPort($(e.target).get(0));
                var mousePos = FIC.mouseCoords_(e);
                var trHeight = trPos.bottom - trPos.y;
                if(mousePos.y - trPos.y < trHeight/2){
                  $($ele).find("#rowMovePosition").css("top",trPos.y - tablePos.y - 3 + "px");
                  indexDiff = 1;
                }
                if(mousePos.y - trPos.y > trHeight/2 && mousePos.y < trPos.bottom){
                  $($ele).find("#rowMovePosition").css("top",trPos.bottom - tablePos.y -3 + "px");
                  indexDiff = -1;
                }
                endIndex = index;
                if(curTag === "tr") endTrDom = $(e.target);
                if(curTag === "td") endTrDom = $(e.target).parent();
              }
                
            }else{
              return;
            }
          };

          $scope.trMouseUp = function(e,index0){
            $($ele).find("#rowMovePosition").css("display","none");
            
            FIC.closeEventsWhenStopDrag(userSelect);
            $($ele).find("tbody tr").each(function(index,element){
              if($(element).hasClass("ciscosb-moving-row")){
                $(element).removeClass("ciscosb-moving-row");
              }
              if($(element).hasClass("ciscosb-mouse-moving")){
                $(element).removeClass("ciscosb-mouse-moving");
              }
            });
            if(rowMovingFlag) {
              var startIndex_ = ($scope.conf.currentPage-1)*$scope.conf.pagesLength + startIndex;
              var endIndex_ = ($scope.conf.currentPage-1)*$scope.conf.pagesLength + endIndex;
              $scope.tableDM = exchangeDataItem(startIndex_, endIndex_, indexDiff, $scope.tableDM);
              setDataStyle();
            }
            exchangeTableRow(startIndex, endIndex, indexDiff, startTrDom, endTrDom);
            startIndex = -1;
            endIndex = -1;
            indexDiff = 0;
            rowMovingFlag = false;

            
          };

          function compareTableDM(oldDM,newDM){
            if(!newDM.length) return;
            if(newDM.length !== oldDM.length) return;
            for(var i = 0; i < oldDM.length; i++){
              for(var j = 0; j < oldDM[i].length; j++){
                if(oldDM[i][j] !== newDM[i][j]){
                  return false;
                }
              }
            }
            return true;
          }

          function exchangeTableRow(startIndex, endIndex, indexDiff, startTrDom, endTrDom){
            if(endIndex - startIndex !== 0){
              if(indexDiff === 1){
                startTrDom.insertBefore(endTrDom);
              }
              if(indexDiff === -1){
                startTrDom.insertAfter(endTrDom);
              }
            }

          }

          function exchangeDataItem(startIndex, endIndex, indexDiff, tableData, currentPage){
            var tempTableData = angular.copy(tableData);
            if(endIndex - startIndex !== 0){
              if(indexDiff === 1){
                var startDataItem = angular.copy(tempTableData.splice(startIndex,1,1));
                tempTableData.splice(endIndex,0,startDataItem[0]);
                for(var i = 0; i < tempTableData.length; i++){
                  if(typeof tempTableData[i] === "number"){
                    tempTableData.splice(i,1);
                    break;
                  }
                }
              }
              if(indexDiff === -1){
                var startDataItem = angular.copy(tempTableData.splice(startIndex,1,1));
                tempTableData.splice(endIndex+1,0,startDataItem[0]);
                for(var i = 0; i < tempTableData.length; i++){
                  if(typeof tempTableData[i] === "number"){
                    tempTableData.splice(i,1);
                    break;
                  }
                }
              }
            }
            return tempTableData;
          }


        }// end of link fn.
    };
  }]);

  ciscosbcs.directive('complexTable', ["$filter", "$timeout", function($filter, $timeout) {
    return {
      restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          complexTableDm:"="
        },
        template: '<div class="ciscosb-complex-table-cntr">'
          +'<div class="ciscosb-cx-tb-tool-cntr">'
            +'<div class="ciscosb-table-toolbar">'
              +'<i class="fa fa-filter ciscosb-table-action-icon" aria-hidden="true" ng-show="showFilterBtn"></i>'
              +'<i class="fa fa-plus ciscosb-table-action-icon" ng-click="showAddNewItemPanel()" ng-show="showAddBtn"></i>'
              +'<i class="fa fa-save ciscosb-table-action-icon" ng-click = "saveData()" ng-show="showSaveBtn"></i>'
              +'<i class="fa fa-history ciscosb-table-action-icon" ng-click = "cancelAddNewItem()" ng-show="showSaveBtn"></i>'
              +'<i class="fa fa-trash-o ciscosb-table-action-icon" ng-click = "deleteRow()" ng-show="showDeleteBtn"></i>'
              +'<i class="fa fa-pencil-square-o ciscosb-table-action-icon" ng-show="showEditBtn" ng-click="editRow()"></i>'
              +'<i class="fa fa-th ciscosb-table-action-icon" ng-click="toggleColSelector()" style="position: relative;z-index: 10;" ng-show="showColSelectorCntr">'
                +'<choose-table-col check-box-items="newswitchData" table-title = "tableTitleDM" ng-show="showTableColSelector"></choose-table-col>'
              +'</i>'
            +'</div>'
            +'<!-- <div class="search-box-cntr">'
              +'<search-box></search-box>'
            +'</div> -->'
          +'</div>'

          +'<div style="position: relative;">'
            +'<!-- model01 -->'
            +'<table class="ciscosb-table ciscosb-table-dom" ng-if="complexTableDm.childNodeType === '+'mode01'+'">'
              +'<thead>'
               +'<tr>'
                  +'<th ng-repeat="tbTitle in tableTitleDM track by $index" ng-click="sortData(tbTitle)" ng-class="setComplexTdStyle(tbTitle)">{{tbTitle.value}}'
                    +'<i class="fa" ng-class="setOrderIconStyle(tbTitle)"></i>'
                    +'<smb-checkbox ng-if="tbTitle.tdType === '+'checkBox'+'" ng-model="testmoel" ng-click="selectAllRows()"></smb-checkbox>'
                  +'</th>'
                +'</tr>'
                +'<tr ng-show="showAddNewRowPanel">'
                  +'<td ng-transclude colspan="{{newswitchData[0].trunk.length}}"></td>'
                +'</tr>'
              +'</thead>'
              +'<tbody>'
                +'<tr ng-repeat-start="rowItem in newswitchData" finished ng-mousedown="trMouseDown($event, $index,rowItem)" ng-mousemove="trMouseMove($event,$index,rowItem)" ng-mouseup="trMouseUp($event,$index)" groupId = "{{rowItem.trunk[0].trunkId}}" nodeType="{{rowItem.trunk[0].nodeType}}" ng-click="selectTrunk(rowItem)">'
                  +'<td ng-repeat="dataItem in rowItem.trunk" ng-class="setComplexTdStyle(dataItem)">'
                    +'<span ng-if="dataItem.tdType === '+'normal'+' && !dataItem.isCtrlVisible">{{dataItem.text}}</span>'
                    +'<smb-radio ng-if="dataItem.tdType === '+'radioBtn'+'" name="complexTableRb"  ng-click="selectRow1(dataItem)" ng-checked="dataItem.checked"></smb-radio>'
                    +'<smb-checkbox ng-if="dataItem.tdType === '+'checkBox'+'" ng-model="dataItem.checked" ng-click="selectRow2(dataItem)"></smb-checkbox>'

                    +'<i class="{{complexTableDm.trunkIcon}}" ng-class="setExpandMark(dataItem)" ng-if="showTrunkIcon(dataItem,$index)" ng-click="clickTrunkIcon($event,dataItem)"></i>'

                    +'<select ng-if="dataItem.contentCntr === '+'select'+' && dataItem.isCtrlVisible" ng-model="selectCtrlVal" ng-change="dataItem.text = selectCtrlVal.name; selectChange(dataItem,selectCtrlVal)" ng-options='+'item.name for item in dataItem.selectDm'+'>'
                        +'<option value = "">-Select a Option-</option>'
                    +'</select>'
                    +'<input type="text" class="form-control" ng-model="dataItem.text" ng-change="textChange(dataItem)" ng-if="dataItem.contentCntr === '+'text'+' && dataItem.isCtrlVisible"/>'
                  +'</td>'
                +'</tr>'

                +'<tr ng-repeat="rowChildItem in rowItem.child"  finished groupId = "{{rowItem.trunk[0].trunkId}}" nodeType="{{rowChildItem[0].nodeType}}" ng-click="selectChild(rowChildItem)" style="display: none;">'
                  +'<td ng-repeat="rowChildItem in rowChildItem" ng-class="setComplexTdStyle(rowChildItem)">'

                    +'<span ng-if="rowChildItem.tdType === '+'normal'+' && !rowChildItem.isCtrlVisible">{{rowChildItem.text}}</span>'
                    +'<smb-radio ng-if="rowChildItem.tdType === '+'radioBtn'+'" name="complexTableRb" ng-click="selectRow1(rowChildItem)" ng-checked="rowChildItem.checked"></smb-radio>'
                    +'<smb-checkbox ng-if="rowChildItem.tdType === '+'checkBox'+'" ng-model="rowChildItem.checked" ng-click="selectRow2(rowChildItem)"></smb-checkbox>'

                    +'<select ng-if="rowChildItem.contentCntr === '+'select'+' && rowChildItem.isCtrlVisible" ng-model="selectCtrlVal" ng-change="rowChildItem.text = selectCtrlVal.name; selectChange(rowChildItem,selectCtrlVal)" ng-options='+'item.name for item in rowChildItem.selectDm'+'>'
                        +'<option value = "">-Select a Option-</option>'
                    +'</select>'
                    +'<input type="text" class="form-control" ng-model="rowChildItem.text" ng-change="textChange(rowChildItem)" ng-if="rowChildItem.contentCntr === '+'text'+' && rowChildItem.isCtrlVisible"/>'
                  +'</td>'
                +'</tr>'
                +'<tr ng-repeat-end></tr>'
              +'</tbody>'
            +'</table>'


            +'<!-- model02 -->'
            +'<table class="ciscosb-table ciscosb-table-dom" ng-if="complexTableDm.childNodeType ==='+'mode02'+' ">'
              +'<thead>'
                +'<tr>'
                  +'<th ng-repeat="tbTitle in tableTitleDM track by $index" ng-click="sortData(tbTitle)" ng-class="setComplexTdStyle(tbTitle)" ng-if="tbTitle.isVisible">'
                    +'<span ng-if="tbTitle.tdType === '+'normal'+'">{{tbTitle.value}}</span>'
                    +'<i class="fa" ng-class="setOrderIconStyle(tbTitle)" ng-if="tbTitle.tdType === '+'normal'+'" style="display: inline;"></i>'
                    +'<smb-checkbox ng-if="tbTitle.tdType === '+'checkBox'+'" ng-model="tbTitle.checked" ng-click="selectRow2(tbTitle,$event)"></smb-checkbox>'
                  +'</th>'
                +'</tr>'
                +'<tr ng-show="showAddNewRowPanel">'
                  +'<td ng-transclude colspan="{{columnLen}}"></td>'
                +'</tr>'
              +'</thead>'
              +'<tbody>'

                +'<tr ng-repeat-start="rowItem in newswitchData" finished ng-mousedown="trMouseDown($event, $index, rowItem)" ng-mousemove="trMouseMove($event,$index,rowItem)" ng-mouseup="trMouseUp($event,$index)" groupId = "{{rowItem.trunk[0].trunkId}}" uniqueId = "{{rowItem.trunk[0].uniqueId}}"  nodeType="{{rowItem.trunk[0].nodeType}}" ng-click="selectTrunk(rowItem)">'
                  +'<td ng-repeat="dataItem in rowItem.trunk" ng-class="setComplexTdStyle(dataItem)" ng-if="dataItem.isVisible">'
                    +'<smb-radio ng-if="dataItem.tdType === '+'radioBtn'+'" name="complexTableRb"  ng-click="selectRow1(dataItem)" class="ciscosb-table-radio" ng-checked="dataItem.checked"></smb-radio>'
                    
                    +'<smb-checkbox ng-if="dataItem.tdType === '+'checkBox'+'" ng-model="dataItem.checked" ng-click="selectRow2(dataItem,$event)"></smb-checkbox>'

                    +'<i class="ciscosb-table-expand-icon" ng-class="setExpandMark(dataItem)" ng-if="showTrunkIcon(dataItem,$index)" ng-click="clickTrunkIcon($event,dataItem)"></i>'
                    +'<span ng-if="dataItem.tdType === '+'normal'+' && !dataItem.isCtrlVisible">{{dataItem.text}}</span>'
                    +'<select ng-if="dataItem.contentCntr === '+'select'+' && dataItem.isCtrlVisible" ng-init="currentSelectItem = setCurrentSelectItemVal(dataItem.selectDm,dataItem.text);" ng-model="currentSelectItem" ng-change="selectCtrlChange(dataItem,currentSelectItem,rowItem)" ng-options='+'item.name for item in dataItem.selectDm'+'>'
                        +'<option value = "">-Select a Option-</option>'
                    +'</select>'
                    +'<input type="text" class="form-control" ng-model="dataItem.text" ng-change="textChange(dataItem)" ng-if="dataItem.contentCntr === '+'text'+' && dataItem.isCtrlVisible"/>'

                    +'<switch-button ng-model='+'dataItem.text'+' ng-if="dataItem.contentCntr === '+'toggleBtn'+' && dataItem.isCtrlVisible"></switch-button>'
                  +'</td>'
                +'</tr>'
                +'<tr ng-repeat-end groupId = "{{rowItem.trunk[0].trunkId}}" nodeType="{{rowItem.child[0][0].nodeType}}" style="display: none;">'
                  +'<td colspan="{{rouItem.trunk.length}}">'
                    +'<table class="ciscosb-table-child" style="margin-left: 20px;">'
                      +'<thead>'
                        +'<tr>'
                          +'<th ng-repeat="childTitle in tableTitleDM1" ng-class="setComplexTdStyle(childTitle)" ng-if="childTitle.isVisible">'
                            +'<span ng-if="childTitle.tdType === '+'normal'+'">{{childTitle.value}}</span>'
                          +'</th>'
                        +'</tr>'
                      +'</thead>'
                      +'<tr ng-repeat = "childDataItem in rowItem.child" ng-click="selectChild(childDataItem)">'
                        +'<td ng-repeat="childDataTd in childDataItem" ng-class="setComplexTdStyle(childDataTd)" ng-if="childDataTd.isVisible">'
                          +'<span ng-if="childDataTd.tdType === '+'normal'+' && !childDataTd.isCtrlVisible">{{childDataTd.text}}</span>'

                          +'<smb-radio ng-if="childDataTd.tdType === '+'radioBtn'+'" name="complexTableRb" ng-click="selectRow1(childDataTd)" class="ciscosb-table-radio" ng-checked="childDataTd.checked"></smb-radio>'
                          +'<smb-checkbox ng-if="childDataTd.tdType === '+'checkBox'+'" ng-model="childDataTd.checked" ng-click="selectRow2(childDataTd,$event)"></smb-checkbox>'

                          +'<select ng-if="childDataTd.contentCntr === '+'select'+' && childDataTd.isCtrlVisible" ng-options='+'item.name for item in childDataTd.selectDm'+'>'
                              +'<option value = "">-Select a Option-</option>'
                          +'</select>'
                          +'<input type="text" class="form-control" ng-model="childDataTd.text" ng-if="childDataTd.contentCntr === '+'text'+' && childDataTd.isCtrlVisible"/>'
                        +'</td>'
                      +'</tr>'
                    +'</table>'
                  +'</td>'
                +'</tr>'
              +'</tbody>'
            +'</table>'
            +'<div id="rowMovePosition" ng-mouseup = "trMouseUp($event)" class="ciscosb-drag-drop-mark"></div>'
          +'</div>'
          +'<div class="ciscosb-table-pagination-cntr" ng-show="isPaginationDis">'
            +'<tm-pagination conf="conf" data="tableDM" tm-data="tmData" ng-model="newswitchData" ng-click="paginationClick($event)" ng-mouseup="paginationMouseup($event)"></tm-pagination>'
          +'</div>'

          +'<model-dialog  dialog-title="Reminder" ng-show="showModelDlg"  config="showModelDialogCF">'
              +'<alert-dialog alert-type="warn"  > '
                 +'<span ng-bind="alertBoxTxt"></span>'
              +'</alert-dialog>'
          +'</model-dialog>'
        +'</div>',

        controller:function($scope,$element,$transclude){
          // pagination
          $scope.conf = {
            currentPage: 1,
            itemsPerPage: 5,
            pagesLength: 5,
            perPageOptions: [5, 10],
            pageTotalPos: 300
          };

          $scope.paginationClick = function(ev) {
            FIC.stopBubble(ev);
          };

          $scope.paginationMouseup = function(ev) {
            FIC.stopBubble(ev);
          };
        },

        link:function($scope, $ele, $attrs){

            if(!$scope.hasOwnProperty("complexTableDm")){
              console.error("The data model from regular table is not available. Please check your data model name.");
              return;
            }

            if(!$scope.complexTableDm){
              return;
            }

            $scope.isPaginationDis = true;
            //pagination visibility.
            if($attrs.hasOwnProperty("haspagination")){
              if($attrs.haspagination === "false"){
                $scope.isPaginationDis = false;
                $scope.conf.itemsPerPage = 10000000000;
              }
            }

            $scope.showAddBtn =  $scope.showDeleteBtn = $scope.showEditBtn = true;
            $scope.showSaveBtn = false;
            if($scope.complexTableDm.hasOwnProperty("readOnly")){
              if($scope.complexTableDm.readOnly){
                $scope.showFilterBtn = true;
                $scope.showSaveBtn = $scope.showDeleteBtn = $scope.showAddBtn= $scope.showEditBtn = false;
              }else{
                $scope.showAddBtn = $scope.showDeleteBtn = $scope.showEditBtn = true;
              }
            }

            $scope.showColSelectorCntr = true;
            if($scope.complexTableDm.hasOwnProperty("columnSelector")){
              if($scope.complexTableDm.columnSelector){
                $scope.showColSelectorCntr = true;
              }else{
                $scope.showColSelectorCntr = false;
              }
            }

            // Table head data model for trunk Table head.
            function setHeaderData(column){
              var tempColumnTitle = [];
              var uniqueId = getId();
              for(var i = 0; i < column.length; i++){
                var tempObj = {};
                if(column[i].hasOwnProperty("title")){
                  tempObj.value = column[i].title;
                }else{
                  tempObj.value = column[i].name;
                }
                if(column[i].hasOwnProperty("isVisible")){
                  column[i].isVisible ? tempObj.isVisible = true : tempObj.isVisible = false;
                }else{
                  tempObj.isVisible = true;
                }
                tempObj.name = column[i].name;
                tempObj.orderDefaultFlag = true;
                tempObj.ascFlag = false;
                tempObj.descFlag = false;
                tempObj.itemIndex = i;
                tempObj.tdType = "normal";
                tempObj.selectFlag = "all";
                tempObj.uniqueId = uniqueId;
                tempColumnTitle.push(tempObj);
              }
              if($scope.complexTableDm.hasRadioBtn){
                tempColumnTitle.unshift({tdType:"radioBtn",value:"",name:"",
                                                        orderDefaultFlag:false,ascFlag:false,
                                                        descFlag:false,itemIndex:-1,selectFlag:"all",
                                                        uniqueId:uniqueId,isVisible:true});
              }else{
                if($scope.complexTableDm.hasCheckBox){
                  tempColumnTitle.unshift({tdType:"checkBox",value:"",name:"",
                                                        orderDefaultFlag:false,ascFlag:false,
                                                        descFlag:false,itemIndex:-1,selectFlag:"all",
                                                        uniqueId:uniqueId,isVisible:true});
                }
              }
              return tempColumnTitle;
            }

            $scope.tableTitleDM = setHeaderData($scope.complexTableDm.column);

            function getId(){
              return Math.round(Math.random() * 10000, 10000) + "" + Math.round(Math.random() * 10000, 10000) + Math.round(Math.random() * 10000, 10000);
            }

            // Table head data model for child Table head.
            function setHeaderData1(column){
              var tempColumnTitle = [];
              for(var i = 0; i < column.length; i++){
                var tempObj = {};
                if(column[i].hasOwnProperty("title")){
                  tempObj.value = column[i].title;
                }else{
                  tempObj.value = column[i].name;
                }
                if(column[i].hasOwnProperty("isVisible")){
                  column[i].isVisible ? tempObj.isVisible = true : tempObj.isVisible = false;
                }else{
                  tempObj.isVisible = true;
                }
                tempObj.name = column[i].name;
                tempObj.itemIndex = i;
                tempObj.tdType = "normal";
                tempObj.selectFlag = "subAll";
                tempColumnTitle.push(tempObj);
              }
              if($scope.complexTableDm.hasRadioBtn){
                tempColumnTitle.unshift({tdType:"readytouse",value:"",name:"",
                                                          itemIndex:-1,selectFlag:"subAll",
                                                          isVisible:true});
              }else{
                if($scope.complexTableDm.hasCheckBox){
                  tempColumnTitle.unshift({tdType:"readytouse",value:"",name:"",
                                                          itemIndex:-1,selectFlag:"subAll",
                                                          isVisible:true});
                }
              }
              return tempColumnTitle;
            }

            // Reorg Table Data Model (trunk row and its child row has the different fileds).
            function setTableData1(tableData,column, childNodeColumn){
              if(!tableData) return;
              var tempArr = [];
              for(var j = 0; j < tableData.length; j++){
                trunkId = getId();
                // trunk.
                var uniqueId = getId();
                if (tableData[j].hasOwnProperty("_trunk_")){
                  var tempTrunkObj = {};
                  var tempItemArr = [];

                  var showExtendIcon= false;
                  if(tableData[j].hasOwnProperty("_child_")){
                    showExtendIcon = true;
                  }

                  for(var i = 0; i < column.length; i++){
                    for(var key in tableData[j]._trunk_){
                      if(key === column[i].name){
                        var temTrunkObj = {};
                        temTrunkObj.nodeType = "t";
                        temTrunkObj.text = tableData[j]._trunk_[key];
                        temTrunkObj.contentCntr = column[i].contentCntr;
                        if(column[i].contentCntr === "select") temTrunkObj.selectDm = column[i].selectDm; 
                        if(column[i].hasOwnProperty("isVisible")){
                          column[i].isVisible ? temTrunkObj.isVisible = true : temTrunkObj.isVisible = false;
                        }else{
                          temTrunkObj.isVisible = true;
                        }
                        if(column[i].hasOwnProperty("isConnectToChild")){
                          column[i].isConnectToChild ? temTrunkObj.isConnectToChild = true : temTrunkObj.isConnectToChild = false;
                        }
                        temTrunkObj.title = column[i].title;
                        temTrunkObj.name = column[i].name;
                        temTrunkObj.trunkId = trunkId;
                        temTrunkObj.uniqueId = uniqueId;
                        temTrunkObj.tdType = "normal";
                        temTrunkObj.selectFlag = "subAll";
                        temTrunkObj.showExtendIcon = showExtendIcon;
                        temTrunkObj.checked = false;
                        temTrunkObj.isExpanded = false;
                        temTrunkObj.selectDmItem = {};
                        tempItemArr.push(temTrunkObj);
                        break;
                      }
                    }
                  }

                  tempTrunkObj.trunk = tempItemArr;

                  // child.
                  if (tableData[j].hasOwnProperty("_child_")){
                    if(FIC.isArray(tableData[j]._child_)){
                      if(tableData[j]._child_.length){
                        var columnSchema = null;
                        arguments[2] ? columnSchema = arguments[2] : columnSchema = arguments[1];
                        if(tableData[j]._child_[0].hasOwnProperty("_trunk_") ||
                          tableData[j]._child_[0].hasOwnProperty("_child_")){
                            tempArr.concat(setTableData1(tableData[j]._child_,column,columnSchema));
                        }else{
                          var temArrForChild = [];
                          for(var i = 0; i < tableData[j]._child_.length; i++){
                              var tt = [];
                              var uniqueId_ = getId();
                              for(var k = 0; k < columnSchema.length; k++){
                                for(var key in tableData[j]._child_[i]){
                                  if(key === columnSchema[k].name){
                                    var temChildArr = {};
                                    temChildArr.nodeType = "c";
                                    temChildArr.text = tableData[j]._child_[i][key];
                                    temChildArr.contentCntr = columnSchema[k].contentCntr;
                                    if(columnSchema[k].contentCntr === "select") temChildArr.selectDm = columnSchema[k].selectDm;
                                    if(columnSchema[k].hasOwnProperty("isVisible")){
                                      columnSchema[k].isVisible ? temChildArr.isVisible = true : temChildArr.isVisible = false;
                                    }else{
                                      temChildArr.isVisible = true;
                                    }
                                    temChildArr.title = columnSchema[k].title;
                                    temChildArr.name = columnSchema[k].name;
                                    temChildArr.trunkId = trunkId;
                                    temChildArr.uniqueId = uniqueId_;
                                    temChildArr.tdType = "normal";
                                    temChildArr.selectFlag = "currentRow";
                                    temChildArr.checked = false;
                                    temChildArr.childSelected = false;
                                    tt.push(temChildArr);
                                    break;
                                  }
                                }
                              }

                              if($scope.complexTableDm.hasRadioBtn){
                                tt.unshift({tdType:"radioBtn",nodeType:"c",text:"",
                                                trunkId:trunkId,selectFlag:"currentRow",
                                                uniqueId:uniqueId_,contentCntr:"",title:"",
                                                name:"",checked:false,childSelected:false,
                                                isVisible:true});
                              }else{
                                if($scope.complexTableDm.hasCheckBox){
                                  tt.unshift({tdType:"checkBox",nodeType:"c",text:"",
                                                trunkId:trunkId,selectFlag:"currentRow",
                                                uniqueId:uniqueId_,contentCntr:"",title:"",
                                                name:"",checked:false,childSelected:false,
                                                isVisible:true});
                                }
                              }

                              temArrForChild.push(tt);
                          }
                          tempTrunkObj.child = temArrForChild;
                        }
                      }
                    }
                  } // end of child

                  if($scope.complexTableDm.hasRadioBtn){
                    tempTrunkObj.trunk.unshift({tdType:"radioBtn",nodeType:"t",text:"",
                                                                trunkId:trunkId,selectFlag:"subAll",
                                                                uniqueId:uniqueId,contentCntr:"",title:"",
                                                                name:"",showExtendIcon:showExtendIcon,
                                                                checked:false,isVisible:true,isExpanded:false,
                                                                isConnectToChild:false,selectDmItem:{}});
                  }else{
                    if($scope.complexTableDm.hasCheckBox){
                      tempTrunkObj.trunk.unshift({tdType:"checkBox",nodeType:"t",text:"",
                                                                trunkId:trunkId,selectFlag:"subAll",
                                                                uniqueId:uniqueId,contentCntr:"",title:"",
                                                                name:"",showExtendIcon:showExtendIcon,
                                                                checked:false,isVisible:true,isExpanded:false,
                                                                isConnectToChild:false,selectDmItem:{}});
                    }
                  }

                  tempArr.push(tempTrunkObj);
                }

              }
              return tempArr; 
              
            } // end of function setTableData1.

            $scope.$watch("complexTableDm",function(){

              // Switch Table Data Model by Customization.
              if($scope.complexTableDm.hasOwnProperty("childNodeType")){
                if($scope.complexTableDm.childNodeType === "mode01"){
                  $scope.tableDM = setTableData1($scope.complexTableDm.tableData,
                                                                      $scope.complexTableDm.column);
                }
                if($scope.complexTableDm.childNodeType === "mode02"){
                  $scope.tableTitleDM1 = setHeaderData1($scope.complexTableDm.childNodeColumn);
                  $scope.tableDM = setTableData1($scope.complexTableDm.tableData,
                                                                    $scope.complexTableDm.column, 
                                                                    $scope.complexTableDm.childNodeColumn);
                }
              }
            },true);

            $scope.setComplexTdStyle = function(dataItem){
              if(dataItem.tdType === "radioBtn" || 
                                          dataItem.tdType === "checkBox" ||
                                          dataItem.tdType === "readytouse"){
                return {"ciscosb-table-action-col":true};
              }
            };
              
            $scope.originalTableDM = angular.copy($scope.tableDM);

            $scope.showTrunkIcon = function(dataItem, index){
              if(dataItem.showExtendIcon){
                return dataItem.nodeType === 't' && !index ? true : false;
              }else{
                return false;
              }
            };

            var selectAllRowsFlag = false;
            $scope.selectAllRows = function(){
              if(!selectAllRowsFlag){
                setAllRowSelected(true);
                selectAllRowsFlag = true;
              }else{
                setAllRowSelected(false);
                selectAllRowsFlag = false;
              }
            };

            function setAllRowSelected(val){
              for(var i = 0; i < $scope.tableDM.length; i++){
                if($scope.tableDM[i].hasOwnProperty("trunk")){
                  for(var j = 0; j < $scope.tableDM[i].trunk.length; j++){
                    $scope.tableDM[i].trunk[j].checked = val;
                  }
                }
                if($scope.tableDM[i].hasOwnProperty("child")){
                  for(var x = 0; x < $scope.tableDM[i].child.length; x++){
                    for(var y = 0; y < $scope.tableDM[i].child[x].length; y++){
                      $scope.tableDM[i].child[x][y].checked = val;
                    }
                  }
                }
              }
            }

            $scope.clickTrunkIcon = function(e,dataItem){
              if($scope.complexTableDm.hasOwnProperty("hasRadioBtn")){
                $scope.selectRow1(dataItem);
              }

              dataItem.isExpanded ? dataItem.isExpanded = false : dataItem.isExpanded = true;
              var dom = $("[groupId="+dataItem.trunkId+"][nodeType='c']");
              dataItem.isExpanded ? dom.show() : dom.hide();

              if($scope.complexTableDm.hasOwnProperty("actions")){
                if($scope.complexTableDm.actions.hasOwnProperty("expandTrunk")){
                  $scope.complexTableDm.actions.expandTrunk(e,dataItem,modifyRowData);
                }
              }
            };

            $scope.setExpandMark = function(dataItem){
              if(dataItem.isExpanded){
                return{"fa fa-chevron-down":true};
              }else{
                return{"fa fa-chevron-right":true};
              }
            }

            // ----- ----- select rows ----- -----
            var selectedItemsDataTag={type:"",groupId:[],selectedData:[]};
            var lastedSelectedData = [];

            // ----- ----- radio button select.----- -----
            $scope.selectRow1 = function(item){
              selectedItemsDataTag = {};
              lastedSelectedData = [];

              if(item.selectFlag === "all"){
                selectedItemsDataTag.type = "allSet";
                selectedItemsDataTag.groupId = item.uniqueId;
                selectedItemsDataTag.selectedData = $scope.tableDM;
              }
              if(item.selectFlag === "subAll"){
                selectedItemsDataTag.type = "subAll";
                selectedItemsDataTag.groupId = item.trunkId;
                selectedItemsDataTag.selectedData = getSelectedItems1($scope.newswitchData, item);
              }
              if(item.selectFlag === "currentRow"){
                selectedItemsDataTag.type = "currentRow";
                selectedItemsDataTag.groupId = item.trunkId;
                selectedItemsDataTag.selectedData = getSelectedItems2($scope.newswitchData, item);
              }
              modifyRowData = lastedSelectedData = angular.copy(selectedItemsDataTag.selectedData);
            };

            function getSelectedItems1(dm,item){
              var dataItem=[];
              for(var i = 0; i < dm.length; i++){
                if(dm[i].trunk[0].uniqueId === item.uniqueId){
                  var tempObj = {};
                  tempObj.trunk = dm[i].trunk;
                  dataItem.push(tempObj);
                  return dataItem;
                }
              }
            }

            function getSelectedItems2(dm,item){
              var dataItem=[];
              for(var i = 0; i < dm.length; i++){
                if(dm[i].hasOwnProperty("child")){
                  for(var x = 0; x < dm[i].child.length; x++){
                    if(dm[i].child[x][0].uniqueId === item.uniqueId){
                      var tempObj = {};
                      tempObj.trunk = dm[i].trunk;
                      tempObj.child = [dm[i].child[x]];
                      dataItem.push(tempObj);
                      return dataItem;
                    }
                  }
                }
              }
            }
            // ----- ----- end of radio button select.----- -----


            // ----- ----- checkbox select.----- -----
            $scope.selectRow2 = function(item,e){
              if(item.selectFlag === "all"){
                selectedItemsDataTag.type = "allSet";
                selectedItemsDataTag.groupId = item.uniqueId;
                selectedItemsDataTag.selectedData = $scope.tableDM;
              }
              if(item.selectFlag === "subAll"){
                selectedItemsDataTag.type = "subAll";
                selectedItemsDataTag.groupId = item.trunkId;
                selectedItemsDataTag.selectedData = getSelectedItems3($scope.tableDM, 
                                                                        item,selectedItemsDataTag,item.checked);
              }
              if(item.selectFlag === "currentRow"){
                selectedItemsDataTag.type = "currentRow";
                selectedItemsDataTag.groupId = item.trunkId;
                selectedItemsDataTag.selectedData = getSelectedItems4($scope.tableDM, 
                                                                        item,selectedItemsDataTag,item.checked);
              }
              modifyRowData = angular.copy(selectedItemsDataTag.selectedData);
            };

            function getSelectedItems3(dm,item,selectedItemsDataTag,checked){
              lastedSelectedData = [];
              var dataItem = [], tempObj = {};
              for(var i = 0; i < dm.length; i++){
                tempObj = {};
                tempObj.trunk = dm[i].trunk;
                if(dm[i].trunk[0].uniqueId === item.uniqueId){
                  dataItem.push(tempObj);
                  lastedSelectedData = dataItem;
                  return compareCd(selectedItemsDataTag.selectedData, dataItem, checked);
                }
              }
            }

            function compareCd(selectedData_,pickedOneData_,checked){
              var _selectedData_ = angular.copy(selectedData_);
              var pickedOneData = angular.copy(pickedOneData_);
              setFlag(pickedOneData[0],true);
              if(_selectedData_.length){
                if(checked){
                  for(var j = 0; j < _selectedData_.length; j++){
                    if(_selectedData_[j].trunk[0].uniqueId === pickedOneData[0].trunk[0].uniqueId){
                      setFlag(_selectedData_[j],true);
                      return _selectedData_;
                    }
                  }
                  _selectedData_.push(pickedOneData[0]);
                }else{
                  for(var i = 0; i < _selectedData_.length; i++){
                    if(_selectedData_[i].trunk[0].uniqueId === pickedOneData[0].trunk[0].uniqueId){
                      if(!_selectedData_[i].hasOwnProperty("child")){
                        _selectedData_.splice(i,1);
                      }else{
                        setFlag(_selectedData_[i],false);
                      }
                      
                      break;
                    }
                  }
                }
              }else{
                return angular.copy(pickedOneData);
              }
              return _selectedData_;
            }

            function setFlag(dmItem,flag){
              if(flag){
                for(var j = 0; j < dmItem.trunk.length; j++){
                  dmItem.trunk[j].checkBoxSelected = true;
                }
              }else{
                for(var j = 0; j < dmItem.trunk.length; j++){
                  if(dmItem.trunk[j].hasOwnProperty("checkBoxSelected")){
                    dmItem.trunk[j].checkBoxSelected = false;
                  }
                  
                }
              }
            }

            function getSelectedItems4(dm,item,selectedItemsDataTag,checked){
              lastedSelectedData = [];
              var dataItem = [], tempObj = {};
              for(var i = 0; i < dm.length; i++){
                tempObj = {};
                tempObj.trunk = dm[i].trunk;

                for(var j = 0; j < dm[i].child.length; j++){
                  if(dm[i].child[j][0].uniqueId === item.uniqueId){
                    tempObj.child = [dm[i].child[j]];
                    dataItem.push(tempObj);
                    lastedSelectedData = dataItem;
                    if(checked){
                      return compareCd_(selectedItemsDataTag.selectedData,dataItem,checked);
                    }else{
                      return minusOne_(selectedItemsDataTag.selectedData,dataItem,checked);
                    }
                  }
                }
              }
            }

            function compareCd_(selectedData_,pickedOneData,checked){
              var _selectedData_ = angular.copy(selectedData_);

              var flag = false;
              for(var j = 0; j < _selectedData_.length; j++){
                if(_selectedData_[j].trunk[0].uniqueId === pickedOneData[0].trunk[0].uniqueId){
                  if(!_selectedData_[j].hasOwnProperty("child")){
                    _selectedData_[j]["child"] = pickedOneData[0].child;
                  }else{
                    _selectedData_[j].child = _selectedData_[j].child.concat(pickedOneData[0].child);
                  }
                  flag = true;
                  
                  break;
                }
              }
              if(!flag){
                _selectedData_.push(pickedOneData[0]);
              }
              return _selectedData_;
            }

            function minusOne_(selectedData_,pickedOneData){
              var _selectedData_ = angular.copy(selectedData_);

              for(var j = 0; j < _selectedData_.length; j++){
                if(_selectedData_[j].trunk[0].uniqueId === pickedOneData[0].trunk[0].uniqueId){
                  for(var i =0; i < _selectedData_[j].child.length; i++){
                    if(_selectedData_[j].child[i][0].uniqueId === pickedOneData[0].child[0][0].uniqueId){
                      _selectedData_[j].child.splice(i,1);

                      if(_selectedData_[j].trunk[0].hasOwnProperty("checkBoxSelected")){
                        if(_selectedData_[j].trunk[0].checkBoxSelected){
                          if(!_selectedData_[j].child.length) delete _selectedData_[j].child;
                        }else{
                          if(!_selectedData_[j].child.length) _selectedData_.splice(j,1);
                        } 
                      }else{
                        if(!_selectedData_[j].child.length) _selectedData_.splice(j,1);
                      }
                      
                      break;
                    }
                  }
                  break;
                }
              }
              return _selectedData_;
            }

            // ----- ----- end of checkbox select.----- -----

            var actionFlag = "";
            $scope.showAddNewItemPanel = function(){
              if($scope.complexTableDm.hasOwnProperty("actions")){
                if($scope.complexTableDm.actions.hasOwnProperty("getAddType")){
                  if(!$scope.complexTableDm.actions.getAddType()){
                    $scope.showSaveBtn = true;
                    $scope.showEditBtn = false;
                    $scope.showAddNewRowPanel = true;
                    actionFlag = "add";
                  }
                }
              }
            };

            var modifyRowData = {};
            // modify one row.
            $scope.editRow = function(){
              modifyRowData = {};
              //_expandChildNode_();
              actionFlag = "modify";
              var selectedDm = selectedItemsDataTag.selectedData;

              if(!selectedDm.length){
                $scope.showModelDlg = true;
                $scope.alertBoxTxt = "Please select a row.";
                return;
              }
              if(selectedDm[0].trunk[0].tdType === "checkBox"){
                if(selectedDm.length > 1 ){
                  $scope.showModelDlg = true;
                  $scope.alertBoxTxt = "Please make sure only one row is selected.";
                  return;
                }
                if(selectedDm[0].hasOwnProperty("child")){
                  if(selectedDm[0].child.length > 1){
                    $scope.showModelDlg = true;
                    $scope.alertBoxTxt = "Please make sure only one row is selected.";
                    return;
                  }
                }
              }

              var idSet;
              if(selectedDm[0].trunk[0].tdType === "checkBox"){
                idSet = getCheckedRow($scope.newswitchData);
                if(!$scope.complexTableDm.hasOwnProperty("canEditRow")){
                  if(idSet.trunkId){
                    setEditableRowCtrl($scope.newswitchData,idSet.trunkId);
                  }else if (idSet.childId){
                    setEditableRowCtrl1($scope.newswitchData,idSet.childId);
                  }
                }
                  
                modifyRowData = angular.copy(selectedItemsDataTag.selectedData);
              }

              if(selectedDm[0].trunk[0].tdType === "radioBtn"){
                idSet = getCheckedRowForRd(selectedDm);

                if(!$scope.complexTableDm.hasOwnProperty("canEditRow")){
                  if(idSet.childId){
                    setEditableRowCtrl1($scope.newswitchData,idSet.childId);
                  }else{
                    setEditableRowCtrl($scope.newswitchData,idSet.trunkId);
                  }
                }
                  
                modifyRowData = angular.copy(selectedItemsDataTag.selectedData);
                expandChildNode_(modifyRowData);
              }
              
              // do something when user clicks edit button.
              if($scope.complexTableDm.hasOwnProperty("actions")){
                if($scope.complexTableDm.actions.hasOwnProperty("edit")){
                  if($scope.complexTableDm.actions.edit(modifyRowData)){
                    $scope.showSaveBtn = false;
                  }else{
                    $scope.showSaveBtn = true;
                  }
                }
              }

            };

            $scope.saveData = function(){
              if(actionFlag === "add"){
                var result = $scope.complexTableDm.actions.save("add");
                if(result){
                  if($scope.showAddNewRowPanel) $scope.showAddNewRowPanel = false;
                  if($scope.showSaveBtn) $scope.showSaveBtn = false;
                  $scope.showEditBtn = true;
                }
              }
              if(actionFlag === "modify"){
                restoreRowData($scope.newswitchData,modifyRowData,false);
                var result = $scope.complexTableDm.actions.save("modify",modifyRowData);
                if(result){
                  modifyRowData = {};
                  normalizeEditableRow($scope.newswitchData);

                  if($scope.showAddNewRowPanel) $scope.showAddNewRowPanel = false;
                  if($scope.showSaveBtn) $scope.showSaveBtn = false;
                  $scope.showEditBtn = true;
                }
              }
            };

            $scope.cancelAddNewItem = function(){
              $scope.showSaveBtn = false;
              $scope.showEditBtn = true;
              $scope.showAddNewRowPanel = false;
              if(actionFlag === "modify"){
                restoreRowData($scope.newswitchData,modifyRowData,true);
              }
              if($scope.complexTableDm.hasOwnProperty("actions")){
                if($scope.complexTableDm.actions.hasOwnProperty("cancel")){
                  $scope.complexTableDm.actions.cancel(modifyRowData);
                }
              }
              normalizeEditableRow($scope.newswitchData);
            };

            $scope.deleteRow = function(){
              var selectedDm = selectedItemsDataTag.selectedData;
              if(!selectedDm.length){
                $scope.showModelDlg = true;
                $scope.alertBoxTxt = "Please select a row.";
                return;
              }
              $scope.complexTableDm.actions.delete(angular.copy(selectedDm));
            };

            function expandChildNode(selectedData,flag){
              for(var i = 0; i < $scope.newswitchData.length; i++){
                if($scope.newswitchData[i].trunk[0].uniqueId === selectedData[0].trunk[0].uniqueId){
                  $scope.newswitchData[i].trunk[0].isExpanded = flag;
                  var dom = $("[groupId="+$scope.newswitchData[i].trunk[0].trunkId+"][nodeType='c']");
                  flag?dom.show():dom.hide();
                  break;
                }
              }
            }

            function expandChildNode_(selectedData){
              for(var i = 0; i < $scope.newswitchData.length; i++){
                var dom = $("[groupId="+$scope.newswitchData[i].trunk[0].trunkId+"][nodeType='c']");
                if($scope.newswitchData[i].trunk[0].uniqueId === selectedData[0].trunk[0].uniqueId){
                  $scope.newswitchData[i].trunk[0].isExpanded = true;
                  dom.show();
                }else{
                  $scope.newswitchData[i].trunk[0].isExpanded = false;
                  dom.hide();
                }
              }
            }

            function _expandChildNode_(){
              for(var i = 0; i < $scope.newswitchData.length; i++){
                var dom = $("[groupId="+$scope.newswitchData[i].trunk[0].trunkId+"][nodeType='c']");
                $scope.newswitchData[i].trunk[0].isExpanded = false;
                dom.hide();
              }
            }

            $scope.showModelDialogCF = {
                mask:{click:function(){}},
                ok:{id:"adsfasdf",show:true,click:function(){}},
                cancel:{disabled:true,show:true}
            };

            function getCheckedRow(dm){
              var idSet={trunkId:"",childId:""};
              for(var i = 0; i < dm.length; i++){
                if(dm[i].hasOwnProperty("trunk")){
                  if(dm[i].trunk[0].checked){
                    idSet.trunkId = dm[i].trunk[0].trunkId;
                  }
                }
                if(dm[i].hasOwnProperty("child")){
                  if(dm[i].child.length){
                    for(var j = 0; j < dm[i].child.length; j++){
                      if(dm[i].child[j][0].checked){
                        idSet.childId = dm[i].child[j][0].uniqueId;
                      }
                    }
                  }
                }
              }
              return idSet;
            }

            function getCheckedRowForRd(dm){
              var idSet={trunkId:"",childId:""};
              if(dm[0].hasOwnProperty("trunk")){
                idSet.trunkId = dm[0].trunk[0].trunkId;
              }
              if(dm[0].hasOwnProperty("child")){
                idSet.childId = dm[0].child[0][0].uniqueId;
              }
              return idSet;
            }

            $scope.toggleColSelector = function(){
              $scope.showTableColSelector = $scope.showTableColSelector?false:true;
            };

            function restoreRowData(dm,backupData_,transcludeFlag){
              if(Object.getOwnPropertyNames(backupData_).length){
                for(var i = 0; i < dm.length; i++){
                  for(var j = 0; j < backupData_.length; j++){
                    if(backupData_[j].hasOwnProperty("trunk")){
                      if(backupData_[j].trunk[0].uniqueId === dm[i].trunk[0].uniqueId){
                        if(transcludeFlag){
                          dm[i].trunk = angular.copy(backupData_[j].trunk) ;
                        }else{
                          backupData_[j].trunk = angular.copy(dm[i].trunk);
                        }
                      }
                    }
                    if(backupData_[j].hasOwnProperty("child")){
                      for(var a = 0; a < backupData_[j].child.length; a++){
                        for(var b = 0; b < dm[i].child.length; b++){
                          if(dm[i].child[b][0].uniqueId === backupData_[j].child[a][0].uniqueId){
                            if(transcludeFlag){
                              dm[i].child[b] = angular.copy(backupData_[j].child[a]);
                            }else{
                              backupData_[j].child[a] = angular.copy(dm[i].child[b]);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            function setEditableRowCtrl(dm,id){
              for(var i = 0; i < dm.length; i++){
                if(dm[i].trunk[0].trunkId === id){
                  for(var j = 0; j < dm[i].trunk.length; j++){
                    dm[i].trunk[j].isCtrlVisible = true;
                  }
                }else{
                  for(var j = 0; j < dm[i].trunk.length; j++){
                    dm[i].trunk[j].isCtrlVisible = false;
                  }
                }
                if(dm[i].hasOwnProperty("child")){
                  if(dm[i].child.length>0){
                    if(FIC.isArray(dm[i].child[0])){
                      for(var k = 0; k < dm[i].child.length; k++){
                        for(var m = 0; m < dm[i].child[k].length; m++){
                          dm[i].child[k][m].isCtrlVisible = false;
                        }
                      }
                    }
                  }
                }
              }
            }

            $scope.selectCtrlChange = function(currentTdData,selectItem,rowdata){
              currentTdData.selectDmItem = selectItem;
              if($scope.complexTableDm.hasOwnProperty("actions")){
                if($scope.complexTableDm.actions.hasOwnProperty("select")){
                  if(typeof $scope.complexTableDm.actions.select === "function"){
                    $scope.complexTableDm.actions.select(currentTdData,selectItem,modifyRowData);
                  }
                }
              }
            };

            $scope.setCurrentSelectItemVal = function(selectDm,text){
              for(var i = 0; i < selectDm.length; i++){
                if(selectDm[i].name === text){
                  return selectDm[i];
                }
              }
            };

            $scope.selectTrunk = function(rowData){
              if($scope.complexTableDm.hasOwnProperty("hasRadioBtn")){
                for(var i = 0; i < $scope.newswitchData.length; i++){
                  if($scope.newswitchData[i].trunk[0].uniqueId === rowData.trunk[0].uniqueId){
                    for(var j = 0; j < $scope.newswitchData[i].trunk.length; j++){
                      $scope.newswitchData[i].trunk[j].checked = true;
                    }
                  }else{
                    for(var j = 0; j < $scope.newswitchData[i].trunk.length; j++){
                      $scope.newswitchData[i].trunk[j].checked = false;
                    }
                  }
                  if($scope.newswitchData[i].hasOwnProperty("child")){
                    for(var a = 0; a < $scope.newswitchData[i].child.length; a++){
                      for(var b = 0; b < $scope.newswitchData[i].child[a].length; b++){
                        $scope.newswitchData[i].child[a][b].checked = false;
                      }
                    }
                  }
                }
                $scope.selectRow1(rowData.trunk[0]);
              }
            };

            $scope.selectChild = function(rowData){
              if($scope.complexTableDm.hasOwnProperty("hasRadioBtn")){
                for(var i = 0; i < $scope.newswitchData.length; i++){
                  if($scope.newswitchData[i].hasOwnProperty("child")){
                    for(var j = 0; j < $scope.newswitchData[i].child.length; j++){
                      if($scope.newswitchData[i].child[j][0].uniqueId === rowData[0].uniqueId){
                        for(var x = 0; x < $scope.newswitchData[i].child[j].length; x++){
                          $scope.newswitchData[i].child[j][x].checked = true;
                        }
                      }else{
                        for(var x = 0; x < $scope.newswitchData[i].child[j].length; x++){
                          $scope.newswitchData[i].child[j][x].checked = false;
                        }
                      }
                    }
                  } 
                  for(var a = 0; a < $scope.newswitchData[i].trunk.length; a++){
                    $scope.newswitchData[i].trunk[a].checked = false;
                  }
                }
                $scope.selectRow1(rowData[0]);
              }
            }

            function setEditableRowCtrl1(dm,id){
              for(var i = 0; i < dm.length; i++){
                for(var j = 0; j < dm[i].trunk.length; j++){
                  dm[i].trunk[j].isCtrlVisible = false;
                }
                if(dm[i].child.length>0){
                  if(FIC.isArray(dm[i].child[0])){
                    for(var k = 0; k < dm[i].child.length; k++){
                      for(var m = 0; m < dm[i].child[k].length; m++){
                        if(dm[i].child[k][m].uniqueId === id){
                          dm[i].child[k][m].isCtrlVisible = true;
                        }else{
                          dm[i].child[k][m].isCtrlVisible = false;
                        }
                        
                      }
                    }
                  }
                }
              }
            }

            function normalizeEditableRow(dm){
              for(var i = 0; i < dm.length; i++){
                for(var j = 0; j < dm[i].trunk.length; j++){
                  dm[i].trunk[j].isCtrlVisible = false;
                  dm[i].trunk[j].isExpanded = false;
                }
                if(dm[i].hasOwnProperty("child")){
                  if(dm[i].child.length>0){
                    if(FIC.isArray(dm[i].child[0])){
                      for(var k = 0; k < dm[i].child.length; k++){
                        for(var m = 0; m < dm[i].child[k].length; m++){
                          dm[i].child[k][m].isCtrlVisible = false;
                        }
                      }
                    }else{
                      setEditableRowCtrl(dm[i].child,id);
                    }
                  }
                }
                  
              }
            }
            
            var orderBy = $filter("orderComplexTable");
            $scope.sortData = function(dataItem){
              if(!dataItem.value) return;
              reSetFlag(dataItem, $scope.tableTitleDM);
              $scope.tableDM = orderBy($scope.tableDM, dataItem.value, getTrue(dataItem));
              setDataStyle();
            };

            $scope.setOrderIconStyle = function(dataItem){
              if(dataItem.orderDefaultFlag) return {"fa-sort":true};
              if(dataItem.ascFlag) return {"fa-sort-asc":true};
              if(dataItem.descFlag) return {"fa-sort-desc":true};
            };

            function reSetFlag(dataItem, tableTitleDM){
              for(var i = 0; i < tableTitleDM.length; i++){
                if(tableTitleDM[i].name === dataItem.name){
                  if(tableTitleDM[i].orderDefaultFlag){
                    tableTitleDM[i].orderDefaultFlag = false;
                    tableTitleDM[i].ascFlag = true;
                    tableTitleDM[i].descFlag = false;
                  }else{
                    tableTitleDM[i].orderDefaultFlag = false;
                    tableTitleDM[i].ascFlag ? tableTitleDM[i].ascFlag = false : tableTitleDM[i].ascFlag = true;
                    tableTitleDM[i].descFlag ? tableTitleDM[i].descFlag = false : tableTitleDM[i].descFlag = true;
                  }
                }else{
                  tableTitleDM[i].orderDefaultFlag = true;
                  tableTitleDM[i].ascFlag = false;
                  tableTitleDM[i].descFlag = false;
                }
              }
            }

            function getTrue(dataItem){
              if(dataItem.ascFlag) return true;
              if(dataItem.descFlag) return false;
            }

            //$scope.newswitchData;
            $scope.$watch("tableTitleDM",function(newVal){
              var len = 0;
              if(newVal){
                if(newVal.length){
                  for(var i = 0; i < newVal.length; i++){
                    if(newVal[i].isVisible){
                      len += 1;
                    }
                  }
                }
                $scope.columnLen = len;
              }
                
            });

            $scope.$on("repeat_finished_msg", function(){
              setDataStyle();
            });

            function setDataStyle(){
              var trStyleDM, tdStyleDM;
              if($scope.complexTableDm.hasOwnProperty("event")){
                if($scope.complexTableDm.event.hasOwnProperty("setTrStyle")){
                  trStyleDM = $scope.complexTableDm.event.setTrStyle;
                  tdStyleDM = $scope.complexTableDm.event.setTdStyle;
                }else{
                  return;
                }
              }else{
                return;
              }
              removeClassForTable(trStyleDM,tdStyleDM);
              $timeout(function(){
                //$(".ciscosb-table-dom [nodetype = 't']")
                $($ele).find("[nodetype = 't']").each(function(index,element){
                  if (typeof $scope.newswitchData[index] === "number" || $scope.newswitchData[index] === undefined) return;
                  for(var i =0; i < trStyleDM.length; i++){
                    if(trStyleDM[i].filter(element,$scope.newswitchData[index])){
                      $(element).addClass(trStyleDM[i].style);
                    }
                  }
                  $(element).find("td").each(function(index0,element0){
                    for(var j = 0; j < tdStyleDM.length; j++){
                      if(tdStyleDM[j].filter(element0,$scope.newswitchData[index]) && tdStyleDM[j].key === $scope.tableTitleDM[index0].name){
                        $(element0).addClass(tdStyleDM[j].style);
                      }
                    }
                  });
                });
              },40);
            }

            function removeClassForTable(trStyleDM,tdStyleDM){
              for(var i =0; i < trStyleDM.length; i++){
                $($ele).find("tbody tr").removeClass(trStyleDM[i].style);
              }
              for(var j = 0; j < tdStyleDM.length; j++){
                $($ele).find("td").removeClass(tdStyleDM[j].style);
              }
            }

            var rowMovingFlag = false;
            var startIndex = -1;
            var endIndex = -1;
            var indexDiff = 0;
            var oldDM = [];
            var newDM = [];
            var startTrDom = null;
            var endTrDom = null;
            var userSelect = FIC.getStyleName("user-select");

            $scope.trMouseDown = function(e,index,rowItem){
              rowMovingFlag = true;
              startIndex = index;
              oldDM = angular.copy($scope.tableDM);

              // var curTag = e.target.tagName.toLowerCase();
              // if(curTag === "tr") startTrDom = $(e.target);
              // if(curTag === "td") startTrDom = $(e.target).parent();

              startTrDom = getTargetDom(rowItem);
              
              FIC.initEventsWhenStartDrag(userSelect);
            };
            
            $scope.trMouseMove = function(e,index,rowItem){
              if(rowMovingFlag){
                var tablePos = FIC.getPosInViewPort($($ele).find(".ciscosb-table-dom").get(0));
                var curTag = e.target.tagName.toLowerCase();
                if(curTag === "tr") $(e.target).addClass("ciscosb-mouse-moving");
                if(curTag === "td") $(e.target).parent().addClass("ciscosb-mouse-moving");
                if(index === startIndex){
                  if(curTag === "tr") $(e.target).addClass("ciscosb-moving-row");
                  if(curTag === "td") $(e.target).parent().addClass("ciscosb-moving-row");
                }
                $($ele).find("#rowMovePosition").css("display","block");
                var trPos = null;
                if(curTag === "tr") trPos = FIC.getPosInViewPort(e.target);
                if(curTag === "td") trPos = FIC.getPosInViewPort($(e.target).parent().get(0));
                if(curTag !== "tr" && curTag !== "td"){
                  trPos = FIC.getPosInViewPort($(e.target).parentsUntil("tr").parent().get(0));
                }
                var mousePos = FIC.mouseCoords_(e);
                var trHeight = trPos.bottom - trPos.y;
                if(mousePos.y - trPos.y < trHeight/2){
                  $($ele).find("#rowMovePosition").css("top",trPos.y - tablePos.y - 2 + "px");
                  indexDiff = 1;
                }
                if(mousePos.y - trPos.y > trHeight/2 && mousePos.y < trPos.bottom){
                  $($ele).find("#rowMovePosition").css("top",trPos.bottom - tablePos.y -2 + "px");
                  indexDiff = -1;
                }
                endIndex = index;
                // if(curTag === "tr") endTrDom = $(e.target);
                // if(curTag === "td") endTrDom = $(e.target).parent();
                endTrDom = getTargetDom(rowItem);
              }else{
                return;
              }
            };

            $scope.trMouseUp = function(e,index0){
              $($ele).find("#rowMovePosition").css("display","none");
              
              FIC.closeEventsWhenStopDrag(userSelect);
              $($ele).find("tbody tr").each(function(index,element){
                if($(element).hasClass("ciscosb-moving-row")){
                  $(element).removeClass("ciscosb-moving-row");
                }
                if($(element).hasClass("ciscosb-mouse-moving")){
                  $(element).removeClass("ciscosb-mouse-moving");
                }
              });
              if(rowMovingFlag) {
                var startIndex_ = ($scope.conf.currentPage-1)*$scope.conf.pagesLength + startIndex;
                var endIndex_ = ($scope.conf.currentPage-1)*$scope.conf.pagesLength + endIndex;
                $scope.tableDM = exchangeDataItem(startIndex_, endIndex_, indexDiff, $scope.tableDM);
                setDataStyle();
              }
              exchangeTableRow(startIndex, endIndex, indexDiff, startTrDom, endTrDom);
              startIndex = -1;
              endIndex = -1;
              indexDiff = 0;
              rowMovingFlag = false;
            };

            function compareTableDM(oldDM,newDM){
              if(!newDM.length) return;
              if(newDM.length !== oldDM.length) return;
              for(var i = 0; i < oldDM.length; i++){
                for(var j = 0; j < oldDM[i].length; j++){
                  if(oldDM[i][j] !== newDM[i][j]){
                    return false;
                  }
                }
              }
              return true;
            }

            function getTargetDom(rowItem){
              var groupId = rowItem.trunk[0].trunkId;
              return $("[groupId="+ groupId +"]");
            }

            function exchangeTableRow(startIndex, endIndex, indexDiff, startTrDom, endTrDom){
              if(endIndex - startIndex !== 0){
                if(indexDiff === 1){
                  startTrDom.insertBefore(endTrDom.first());
                }
                if(indexDiff === -1){
                  startTrDom.insertAfter(endTrDom.last());
                }
              }

            }

            function exchangeDataItem(startIndex, endIndex, indexDiff, tableData, currentPage){
              var tempTableData = angular.copy(tableData);
              if(endIndex - startIndex !== 0){
                if(indexDiff === 1){
                  var startDataItem = angular.copy(tempTableData.splice(startIndex,1,1));
                  tempTableData.splice(endIndex,0,startDataItem[0]);
                  for(var i = 0; i < tempTableData.length; i++){
                    if(typeof tempTableData[i] === "number"){
                      tempTableData.splice(i,1);
                      break;
                    }
                  }
                }
                if(indexDiff === -1){
                  var startDataItem = angular.copy(tempTableData.splice(startIndex,1,1));
                  tempTableData.splice(endIndex+1,0,startDataItem[0]);
                  for(var i = 0; i < tempTableData.length; i++){
                    if(typeof tempTableData[i] === "number"){
                      tempTableData.splice(i,1);
                      break;
                    }
                  }
                }
              }
              return tempTableData;
            }

        }// end of link fn.
    };
  }]);

  return ciscosbcs;
});