let NodeMonkey = require('node-monkey')
NodeMonkey()

var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs');
var path = require('path');

var http = require('https');
var requestTemplate = require('request');

exports.postReport = function(request, response) {
  var data = JSON.parse(request.body);
  
  var report = {
    board: data.board.name,
    sprint: data.board.hka_sprintnumber,
    start: data.board.hka_sprintstart,
    end: data.board.hka_sprintend,
    milestones: [],
    lists: [],
  }
  
  for (var i = 0; i < data.board.cards.length; i++) {
    if (data.board.cards[i].isMilestone) {
      var card = data.board.cards[i];
      var milestone = {
        title: card.name,
        start: card.milestone_start,
        anticipated: card.milestone_anticipated,
        actual: card.milestone_actual,
        status: card.milestone_status,
        state: card.milestone_state,
        url: card.shortUrl
      }
      report.milestones.push(milestone);
    }
  }
  
  for (var j = 0; j < data.board.hka_reportedLists.length; j++) {
    var validList = data.board.lists.filter(e => e.id === data.board.hka_reportedLists[j].listId);
    if (validList.length > 0) {
      var list = {
        title: data.board.hka_reportedLists[j].title || data.board.hka_reportedLists[j].listName,
        groupbylabels: data.board.hka_reportedLists[j].groupbylabels || false,
        labels: []
      }
      
      var cards = data.board.cards.filter(f => f.idList === validList[0].id);
      if (cards.length > 0) {
        
        if (data.board.hka_reportedLists[j].groupbylabels) {
          var distinct = []
          for (var k = 0; k < cards.length; k++) {
            if(cards[k].labels.length == 0 || distinct[cards[k].labels[0].id]) continue;
             distinct[cards[k].labels[0].id] = true;
             list.labels.push({
               id: cards[k].labels[0].id,
               color: cards[k].labels[0].color,
               name: cards[k].labels[0].name,
               show: true,
               cards: []
             })
          }
        } else {
          list.labels.push({
            name: 'none',
            show: false,
            cards: []
          });
        }
        //console.dir(list.labels);
      }
      report.lists.push(list);
    }
  }
  
  console.dir(report);
  
  requestTemplate({
    method: "GET",
    url:'https://cdn.glitch.com/02f96b35-f91f-4d0e-b671-c0882533598f%2FSprintReportTemplate.docx?1516892746666',
    encoding: null
  }, function(error,res,body) {
    if(error ||  res.statusCode !== 200) {
    //if (res.statusCode !== 200) {
      console.log(res.statusCode);
      return;
    }

      var zip = new JSZip
      zip.load(body)
        
        
      var doc = new Docxtemplater();
      doc.loadZip(zip);
        
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
    
    //response.send("Hi");
  });
  
  //var zip = new JSZip(content);
  
}