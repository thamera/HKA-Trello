//let NodeMonkey = require('node-monkey')
//NodeMonkey()

//var officegen = require('officegen');
var xl = require('excel4node');

exports.postLog = function(request, response) {
  var data = JSON.parse(request.body) 
  //console.log(data.risks);
  
  var wbOptions = {
    defaultFont: {
      size: 10,
      name: 'Arial Narrow'
    },
    dateFormat: 'm/d/yy hh:mm:ss'
  }
  
  var wb = new xl.Workbook(wbOptions);
  
  var wsOptions = {
    'margins': {
        'bottom': .75,
        'footer': .3,
        'header': .3,
        'left': .5,
        'right': .5,
        'top': .75
    },
    'pageSetup': {
      'fitToHeight': 1,
      'fitToWidth': 1,
      'paperSize': 'LETTER_PAPER'
    },
    'sheetView': {
      'showGridLines': false
    },
    'sheetFormat': {
      'defaultRowHeight': 16.5
    }
  }
  
  var ws = wb.addWorksheet('Security Log',wsOptions);
  //var ws2 = wb.addWorksheet('Score Matrix',wsOptions);
  
  var styleTitle = wb.createStyle({
    alignment: {horizontal: 'center',wrapText: true,vertical:'center'},
    font: { size: 24, bold: true, color: 'FFFFFF', name: 'Arial'},
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    fill: { type: 'pattern', patternType: 'solid', fgColor: '808080' },
  });
  
  var styleHdg = wb.createStyle({
    alignment: {horizontal: 'center',wrapText: true,vertical:'center'},
    font: { size: 10, bold: true },
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    numberFormat: '0'
  });
  var styleHdgGrn = wb.createStyle({
    alignment: {horizontal: 'center',wrapText: true,vertical:'center'},
    font: { size: 10, bold: true , color: '006100'},
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    fill: { type: 'pattern', patternType: 'solid', fgColor: 'C6EFCE' },
    numberFormat: '0'
  });
  var styleStd = wb.createStyle({
    alignment: {horizontal:'center',wrapText: true},
    font: { size: 10 },
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    numberFormat: '0'
  });
  var styleStdLeft = wb.createStyle({
    alignment: {horizontal:'left',wrapText: true},
    font: { size: 10 },
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    numberFormat: '0'
  });
  var styleCurrency = wb.createStyle({
    alignment: {horizontal:'right',wrapText: true},
    font: { size: 10 },
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    numberFormat: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
  });
  var styleDate = wb.createStyle({
    alignment: {horizontal:'right',wrapText: true},
    font: { size: 10 },
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    numberFormat: 'm/d/yyyy'
  });
  var styleGrnBack = wb.createStyle({
    alignment: {horizontal:'center',wrapText: true},
    font: { size: 10, color: '006100'},
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    fill: { type: 'pattern', patternType: 'solid', fgColor: 'C6EFCE' },
    numberFormat: '0'
  });
  var styleGrnBackLeft = wb.createStyle({
    alignment: {horizontal:'left',wrapText: true},
    font: { size: 10, color: '006100'},
    border: { left: { style: 'thin' },
        right: { style: 'thin' },
        top: { style: 'thin' },
        bottom: { style: 'thin' },
    },
    fill: { type: 'pattern', patternType: 'solid', fgColor: 'C6EFCE' },
    numberFormat: '0'
  });
  
  ws.row(2).setHeight(37.5);
  
  ws.row(5).setHeight(39.75);
  
  ws.column(1).setWidth(2);
  ws.column(2).setWidth(30);
  ws.column(3).setWidth(30);
  ws.column(4).setWidth(11);
  ws.column(5).setWidth(10);
  ws.column(6).setWidth(10);
  ws.column(7).setWidth(10);
  ws.column(8).setWidth(10);
  ws.column(9).setWidth(10);
  ws.column(10).setWidth(10);
  ws.column(11).setWidth(70);
  
  //Title
  ws.cell(2,2,2,10,true).string('Security Log').style(styleTitle);
  ws.cell(3,2,3,10,true).string(data.board.name).style(styleHdg);
  
  //Row Headings
  ws.cell(5,2).string('Card Name').style(styleHdg);
  ws.cell(5,3).string('Security Group').style(styleHdg);
  ws.cell(5,4).string('Complete').style(styleHdg);
  ws.cell(5,5).string('Full Access').style(styleHdgGrn);
  ws.cell(5,6).string('Create Records').style(styleHdgGrn);
  ws.cell(5,7).string('Edit Records').style(styleHdgGrn);
  ws.cell(5,8).string('Delete Records').style(styleHdgGrn);
  ws.cell(5,9).string('View Only').style(styleHdgGrn);
  ws.cell(5,10).string('No Access').style(styleHdgGrn);
  ws.cell(5,11).string('Notes').style(styleHdg);
  
  var startRow = 6;
  for (var i = 0; i < data.securityreqs.length;i++) {
    var securityreqs = data.securityreqs[i];
    var currentRow = startRow + i;
    var id = i + 1;
    //console.dir(risk);
    ws.cell(currentRow,2).style(styleStd).link(securityreqs.shortUrl,securityreqs.name.toString(),'');
    ws.cell(currentRow,3).string(securityreqs.group || '').style(styleStd);
    ws.cell(currentRow,4).string(securityreqs.complete.toString() || 'False').style(styleStd);
    ws.cell(currentRow,5).string(securityreqs.full.toString() || 'False').style(styleGrnBack);
    ws.cell(currentRow,6).string(securityreqs.create.toString() || 'False').style(styleGrnBack);
    ws.cell(currentRow,7).string(securityreqs.edit.toString() || 'False').style(styleGrnBack);
    ws.cell(currentRow,8).string(securityreqs.delete.toString() || 'False').style(styleGrnBack);
    ws.cell(currentRow,9).string(securityreqs.view.toString() || 'False').style(styleGrnBack);
    ws.cell(currentRow,10).string(securityreqs.noaccess.toString() || 'False').style(styleGrnBack);
    ws.cell(currentRow,11).string(securityreqs.note || '').style(styleStd);
  }
  
  response.set({
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    'Content-disposition': 'attachment; filename=SecurityLog.xlsx'
  });
  wb.write('SecurityLog.xlsx',response);
  
};