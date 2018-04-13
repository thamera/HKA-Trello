let NodeMonkey = require('node-monkey')
NodeMonkey()

var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');

//var fs = require('fs');
//var path = require('path');

var http = require('https');
//var requestTemplate = require('request');
const axios = require("axios");

var moment = require('moment');
var expressions = require('angular-expressions');

exports.postReport = function(request, response) {
  var data = JSON.parse(request.body);
  
  var report = {
    board: data.board.name,
    m: [],
    lists: []
  }
  
  //console.dir(report);

  expressions.filters.dateFormat = function(input) {
      // This condition should be used to make sure that if your input is undefined, your output will be undefined as well and will not throw an error
      if(!input) return input;
      return moment(input).format(dateFormat(data.board.hka_dateformat));
  }

  var angularParser = function(tag) {
      var e, expr;
      try {
        expr = expressions.compile(tag);
      } catch (_error) {
        e = _error;
        console.log("parsing didn't work with " + tag);
      }
      return {
        get: function(scope) {
          if (scope == null) {
            console.log('warning: scope undefined');
          }
          try {
            return expr(scope);
          } catch (_error) {
            e = _error;
            console.log("parsing didn't work with " + tag);
            return "undefined";
          }
        }
      };
    };
  
  axios
  .get('https://trelloapp.hka-tech.com/templates/CardTemplate.docx', {
    responseType: 'arraybuffer'
  })
  .then(res => {
    
    var zip = new JSZip
    zip.load(res.data)


    var doc = new Docxtemplater().loadZip(zip).setOptions({parser:angularParser,paragraphLoop:true}); //.setOptions({parser:angularParser})

    //set the templateVariables
    doc.setData(report);

    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render()
    }
    catch (error) {
      var e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties,
      }
      console.log(JSON.stringify({error: e}));
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
      throw error;
    }

    var buf = doc.getZip()
         .generate({type: 'nodebuffer'});

    response.end(buf);
    
  })
  .catch(error => {
    console.log(error);
  });
  
}

function dateFormat(format){
  switch (format){
    case "short": return 'M/D/YY hh:mm:ss A';
    case "medium": return 'MMM D, YYYY hh:mm:ss A';
    case "fullDate": return 'dddd, MMMM D, YYYY hh:mm:ss A';
    case "longData": return 'MMMM D, YYYY';
    case "mediumDate": return 'MMM D, YYYY';
    case "shortDate": return 'M/D/YY';
    case "EEE, d MMM y": return 'dddd, d MMM y';
    default: return format;
  }
}
