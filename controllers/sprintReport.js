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
    sprint: data.board.hka_sprintnumber,
    start: moment(data.board.hka_sprintstart).format(dateFormat(data.board.hka_dateformat)),
    end: moment(data.board.hka_sprintend).format(dateFormat(data.board.hka_dateformat)),
    m: [],
    lists: []
  }
  
  for (var i = 0; i < data.board.cards.length; i++) {
    if (data.board.cards[i].isMilestone) {
      var card = data.board.cards[i];
      var milestone = {
        title: card.name,
        start: moment(card.milestone_start).format(dateFormat(data.board.hka_dateformat)),
        anticipated: moment(card.milestone_anticipated).format(dateFormat(data.board.hka_dateformat)),
        actual: moment(card.milestone_actual).format(dateFormat(data.board.hka_dateformat)),
        s: card.milestone_status, //state
        c: card.milestone_state, //complete
        url: card.shortUrl,
        format: data.board.hka_dateformat
      }
      report.m.push(milestone);
    }
  }
  
  for (var j = 0; j < data.board.hka_reportedLists.length; j++) {
    var validList = data.board.lists.filter(e => e.id === data.board.hka_reportedLists[j].listId);
    if (validList.length > 0) {
      var list = {
        title: data.board.hka_reportedLists[j].title || data.board.hka_reportedLists[j].listName,
        groupbylabels: data.board.hka_reportedLists[j].groupbylabels || false,
        labels: [],
        nolabels: []
      }
      
      var cards = data.board.cards.filter(f => f.idList === validList[0].id);
      if (cards.length > 0) {
        
        if (data.board.hka_reportedLists[j].groupbylabels) {
          var distinct = []
          distinct["0"] = "";
          for (var k = 0; k < cards.length; k++) {
            if(cards[k].labels.length != 0){
              cards[k]["thisLabel"] = { name: cards[k].labels[0].name, id: cards[k].labels[0].id};
              
              if(!distinct[cards[k].labels[0].id]) {
               distinct[cards[k].labels[0].id] = cards[k].labels[0].name;
              }
            } else { 
              cards[k]["thisLabel"] = { name:"",id:"0"} 
            };
          }
          
          for(var label in distinct) {
            
            var filteredCards = cards.filter(f => f.thisLabel.id === label);
            if (filteredCards.length === 0) continue;
            
            var _label = {name: distinct[label], cards: []};
            
            for (var l = 0; l < filteredCards.length; l++){
               var card = {
                 id: cards[l].id,
                 title: filteredCards[l].name,
                 desc: filteredCards[l].desc,
                 checklists:filteredCards[l].checklists,
                 comments:[],
                 includechecklist: data.board.hka_reportedLists[j].includechecklists || false,
                 includecomments: data.board.hka_reportedLists[j].includecomments || false,
                 includedescription: data.board.hka_reportedLists[j].includedescription || false
               }
               var filteredComments = data.comments.filter(c => c.data.card.id === filteredCards[l].id);
               if (filteredComments.length > 0) card.comments = filteredComments;
               
               if (card.checklists.length === 0) card.includechecklist = false;
               if (card.comments.length === 0) card.includecomments = false;
               //console.dir(card);
               if (_label.name === "") {
                 list.nolabels.push(card);
               } else {
                 _label.cards.push(card);
               }
              //console.dir(card);
            }
            //console.dir(_label);
            if(_label.cards.length > 0) list.labels.push(_label);
          }
          
        } else {
          for (var l = 0; l < cards.length; l++) {
            var card = {
              id: cards[l].id,
              title: cards[l].name,
              desc: cards[l].desc,
              checklists:[],
              comments:[],
              includechecklist: data.board.hka_reportedLists[j].includechecklists || false,
              includecomments: data.board.hka_reportedLists[j].includecomments || false,
              includedescription: data.board.hka_reportedLists[j].includedescription || false
            }
            var filteredComments = data.comments.filter(c => c.data.card.id === filteredCards[l].id);
            if (filteredComments.length > 0) card.comments = filteredComments;
            
            if (card.checklists.length === 0) card.includechecklist = false;
            if (card.comments.length === 0) card.includecomments = false;
            list.nolabels.push(card);
          }
        }
        
      }
      report.lists.push(list);
    }
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
  .get('https://trelloapp.hka-tech.com/templates/SprintReportTemplate.docx', {
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
  
  /*
  
  requestTemplate({
    method: "GET",
    url:'https://trelloapp.hka-tech.com/templates/SprintReportTemplate.docx',
    encoding: null
  }, function(error,res,body) {
    if(error ||  res.statusCode !== 200) {
    //if (res.statusCode !== 200) {
      console.log(res.statusCode);
      return;
    }

      var zip = new JSZip
      zip.load(body)
        
        
      var doc = new Docxtemplater().loadZip(zip).setOptions({paragraphLoop:true});
        
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
      //});
        
    //});
    
    
  });
  */
  //response.send("Hi");
  //var zip = new JSZip(content);
  
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