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
  
  var ws = wb.addWorksheet('Risk Register',wsOptions);
  var ws2 = wb.addWorksheet('Score Matrix',wsOptions);
  
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
  
  ws.column(1).setWidth(3);
  ws.column(2).setWidth(4);
  ws.column(3).setWidth(11);
  ws.column(4).setWidth(10);
  ws.column(5).setWidth(10);
  ws.column(6).setWidth(30);
  ws.column(7).setWidth(12);
  ws.column(8).setWidth(11);
  ws.column(9).setWidth(10);
  ws.column(10).setWidth(8);
  ws.column(11).setWidth(10);
  ws.column(12).setWidth(25);
  ws.column(13).setWidth(12);
  ws.column(14).setWidth(12);
  ws.column(15).setWidth(10);
  ws.column(16).setWidth(10);
  ws.column(17).setWidth(30);
  
  //Title
  ws.cell(2,2,2,17,true).string('Risk Register').style(styleTitle);
  
  //Row Headings
  ws.cell(5,2).string('ID').style(styleHdg);
  ws.cell(5,3).string('Status').style(styleHdg);
  ws.cell(5,4).string('Status Date').style(styleHdg);
  ws.cell(5,5).string('Category').style(styleHdg);
  ws.cell(5,6).string('Description of Risk').style(styleHdgGrn);
  ws.cell(5,7).string('Trigger').style(styleHdg);
  ws.cell(5,8).string('Probability').style(styleHdgGrn);
  ws.cell(5,9).string('Impact').style(styleHdgGrn);
  ws.cell(5,10).string('Score').style(styleHdg);
  ws.cell(5,11).string('Response').style(styleHdg);
  ws.cell(5,12).string('Plan').style(styleHdgGrn);
  ws.cell(5,13).string('Impact to Schedule (Days)').style(styleHdg);
  ws.cell(5,14).string('Impact to Cost ($)').style(styleHdg);
  ws.cell(5,15).string('Owner').style(styleHdg);
  ws.cell(5,16).string('Date Identified').style(styleHdg);
  ws.cell(5,17).string('Notes').style(styleHdg);
  
  var riskStartRow = 6;
  for (var i = 0; i < data.risks.length;i++) {
    var risk = data.risks[i];
    var currentRow = riskStartRow + i;
    var id = i + 1;
    //console.dir(risk);
    ws.cell(currentRow,2).style(styleStd).link(risk.shortUrl,id.toString(),id.toString());
    ws.cell(currentRow,3).string(risk.hka_riskStatus).style(styleStd);
    ws.cell(currentRow,4).date(risk.dateLastActivity).style(styleDate);
    ws.cell(currentRow,5).string(risk.hka_riskCategory).style(styleStd);
    ws.cell(currentRow,6).string(risk.desc).style(styleGrnBackLeft);
    ws.cell(currentRow,7).string('').style(styleStd);
    ws.cell(currentRow,8).string(getScoreLabel(risk.hka_riskProbability)).style(styleGrnBack);
    ws.cell(currentRow,9).string(getScoreLabel(risk.hka_riskImpact)).style(styleGrnBack);
    ws.cell(currentRow,10).number(risk.hka_riskScore).style(styleStd);
    ws.cell(currentRow,11).string(risk.hka_riskResponse).style(styleStd);
    ws.cell(currentRow,12).string('').style(styleGrnBackLeft);
    ws.cell(currentRow,13).number(risk.hka_riskImpactSchedule).style(styleStd);
    ws.cell(currentRow,14).number(risk.hka_riskImpactCost).style(styleCurrency);
    ws.cell(currentRow,15).string('').style(styleStd);
    ws.cell(currentRow,16).string('').style(styleDate);
    ws.cell(currentRow,17).string('').style(styleStdLeft);
  }
  
  response.set({
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    'Content-disposition': 'attachment; filename=RiskRegister.xlsx'
  });
  wb.write('RiskRegister.xlsx',response);
  
};

function getScoreLabel(value){
   switch (value) {
        case 1: 
            return 'Low'
            break;
        case 2: 
            return 'Medium'
            break;
        case 3: 
            return 'High'
            break;
        default:
            return ''
            break;
    }
}