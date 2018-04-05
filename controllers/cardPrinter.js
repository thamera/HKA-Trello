let NodeMonkey = require('node-monkey')
NodeMonkey()

var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var grep = require('grep-from-array');

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
    cards: []
  }
  
  var cards = grep(data.board.cards, function(card) { return card.print == true });
  //console.dir(cards);
  for( var i = 0; i < cards.length; i++){
    //console.log(card.name);
    var tempCard = { 
      name: cards[i].name,
      description: cards[i].desc,
      url: cards[i].shortUrl,
      due: moment(cards[i].due).format(dateFormat(data.board.hka_dateformat)),
      listname: grep(data.board.lists, function(list) { return list.id == cards[i].idList })[0].name || '',
      members: [],
      checklists: cards[i].checklists,
      attachments: [],
      comments: grep(data.comments, function(comment) { return comment.data.card.id == cards[i].id })
    }
    
    for ( var c = 0; c < tempCard.checklists.length; c++) {
      if (tempCard.checklists[c].name.indexOf("Attendee") != -1) { tempCard.checklists[c].isAttendee = true }
      else if (tempCard.checklists[c].name.indexOf("Agenda") != -1) { tempCard.checklists[c].isAgenda = true }
      else if (tempCard.checklists[c].name.indexOf("Attendee") != -1) { tempCard.checklists[c].isAttendee = true }
      else { tempCard.checklists[c].isChecklist = true }
      
      for (var d = 0; d < tempCard.checklists[c].checkItems.length; d++) {
        if (tempCard.checklists[c].checkItems[d].state == "complete") {
          tempCard.checklists[c].checkItems[d]["complete"] = true;
        }
      }
    }
    
    /*for ( var m = 0; m < cards[i].idMembers; m++) {
       var member = grep(data.board.memberships , function(member) { return member });
    }*/
    //console.dir(tempCard);
    report.cards.push(tempCard);
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
            console.log("parsing didn't work with " + tag + " | " + e);
            return "undefined";
          }
        }
      };
    };
  
  axios
  .get('http://trelloapp.hka-tech.com/templates/CardTemplate.docx', {
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