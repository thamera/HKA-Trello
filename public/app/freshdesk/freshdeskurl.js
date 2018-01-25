/* global TrelloPowerUp, Freshdesk, moment */

var t = window.TrelloPowerUp.iframe();

var apiKey = t.arg('apiKey');
Freshdesk.setKey(apiKey);
Freshdesk.setEndpoint(t.arg('freshdeskUrl'));

//var conversations = {};

t.render(function () {
    t.card('attachments')
        .get('attachments')
        .filter(function (attachment) {
            return attachment.url.indexOf('.freshdesk.com/') != -1 && attachment.url.indexOf('/tickets/') != -1 ;
        })
        .then(function (freshdeskAttachment) {
            var urls = freshdeskAttachment.map(function (a) { return a.url; });
            
            for (var i = 0; i < urls.length; i++) {
              var thisUrl = urls[i];
              var thisTicketId = thisUrl.substr(thisUrl.lastIndexOf('/') + 1);

              Freshdesk.get('tickets/' + thisTicketId + '?include=conversations', {}, true, function (data) {
                onGetSuccess(data, thisUrl);
              }, function (data) {
                  onGetFailure(data, thisTicketId);
              });
            }
        })
        .then(function () {
            return t.sizeTo('#content');
        });
});

var onGetSuccess = function (data,url) {  
  var html = '<div id="FD_' + data.id + '" class="freshdesk_ticket">';
  html += '<h1><a href="' + url + '" target="_blank">[' + data.id + '] ' + data.subject + '</a></h1>';
  html += '<div class="freshdesk_ticket_desc">' + data.description + '</div>';
  html += '<span class="freshdesk_ticket_details">';
  html += '<span>Assigned To<br/><strong>' + data.responder_id + '</strong></span>';
  html += '<span>Created<br/><strong>' + moment(data.created_at).format('MM/DD/YYYY') + '</strong></span>';
  html += '<span>Due<br/><strong>' + moment(data.due_by).format('MM/DD/YYYY') + '</strong></span>';
  html += '<span>Last Update<br/><strong>' + moment(data.due_by).format('MM/DD/YYYY') + '</strong></span>';
  html += '<span>Status<br/><strong>' + Freshdesk.status(data.status) + '</strong></span>';
  
  if( data.conversations.length > 0) html += '</span><div><button id="FD_CONV_BTN_' + data.id + '" onclick="getConversation(' + data.id + ')" type="button" class="mod-primary">Get Recent Comments</button></div>';
  html += '<div id="FD_CONV_' + data.id + '" class="freshdesk_ticket_conv" style="display:none;">';
  for (var i = data.conversations.length - 1; i > 0; i--) {
    html += '<div><div class="freshdesk_ticket_conv_head"><strong>' + (i + 1) + '</strong> ' + moment(data.conversations[i].created_at).format('MM/DD/YYYY') + ' ' + data.conversations[i].from_email + '</div>';
    html += data.conversations[i].body;
    html += '</div>'
  }
  html += '</div>';
  
  if (data.attachments.length > 0) {
    html += '<div>Attachments<ul class="freshdesk_ticket_attachments">';
    for (var i = 0; i < data.attachments.length; i++) {
      html += '<li><a href="' + data.attachments[i].attachment_url + '" target="_blank">' + data.attachments[i].name + '</a></li>';
    }
    html += '</ul></div>';
  }
  
  html += '</div>';
  $("#content").append(html);
  
  $(document).ready(function() {
    $('#ticketDescription_' + data.id).summernote({toolbar: [
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['font', ['strikethrough', 'superscript', 'subscript']],
      ['fontsize', ['fontsize','color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['styling', ['style','height']],
      ['insert',['link','table','hr']],
      ['misc',['codeview','undo','redo','help']]
    ]});
    
    
  });
  
  t.sizeTo('#content');
}

$('#content').on('click','.addComment', function(){
  t.popup({
     //icon: ICON_FD,
     title: 'Freshdesk Authentication Required',
     url: './freshdeskupdate.html',
     height: 500,
     //args: { redirectUrl: 'freshdeskLink', freshdeskUrl: hka_freshdeskurl }
  });
});

var onGetFailure = function (data, ticketId) {
    var html = "<div>Error obtaining freshdesk data from freshdesk API for ticket id: " + ticketId;
    $("#content").append(html);
}

var getConversation = function (ticketId) {
  $('#FD_CONV_BTN_' + ticketId).text(function(i, text){
    return text === "Get Recent Comments" ? "Hide Comments" : "Get Recent Comments";
  })
  $('#FD_CONV_' + ticketId).toggle();
  t.sizeTo('#content');
}