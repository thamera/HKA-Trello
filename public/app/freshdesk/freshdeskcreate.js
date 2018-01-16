/* global TrelloPowerUp, Freshdesk, moment, Trello */

var t = window.TrelloPowerUp.iframe();

Trello.setKey(t.arg('apiKey'));
Trello.setToken(t.arg('apiToken'));
Freshdesk.setEndpoint(t.arg('freshdeskUrl'));

var card = {};
var requester = {};
var filesToUpload = [];

t.render(function () {
  var context = t.getContext();
  var filesUploader = $("#ticketFileContainer").fileUploader(filesToUpload, "ticketFiles");
  
  Trello.get('cards/' + context.card,{fields:'all',members:'true',member_fields:'all',attachments:'true',attachment_fields:'all'},function(card) {
    card = card;
    
    Trello.get('members/'+ context.member,{},function(member) {
      requester = member;

      document.getElementById('ticketReqester').value = requester.email;
      document.getElementById('ticketSubject').value = card.name;
      document.getElementById('ticketDescription').value = card.desc;
      
      return t.sizeTo('#freshdesk_create');
    });
  });
  //});
});

window.freshdesk_create.addEventListener('submit', function(event){
  event.preventDefault();
  
  Freshdesk.setKey(t.arg('freshdeskKey'));
  
  var isValid = true;
  var invalidMsg = '';
  var regex = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
  var filePromises = [];
  
  var requester = document.getElementById('ticketReqester').value;
  
  var ccValue = document.getElementById('ticketCC').value;
  var cc = [] 
  if (ccValue != "" ) cc = document.getElementById('ticketCC').value.split(",");
  
  for (var i = 0; i < cc.length; i++){
    if ( cc[i] == "" || ! regex.test(cc[i])){
      isValid = false;
      alert("Invalid CC list.  List must be valid emails separated by a comma (no extra spaces).");
      return;
    }
  }
  if ( requester == "" || ! regex.test(requester) ){ 
      alert("Invalid Request Email Addres.");
      return; 
  }
  
  var data = new FormData();
  data.append('description', document.getElementById('ticketDescription').value);
  data.append('subject',document.getElementById('ticketSubject').value);
  data.append('email',requester);
  data.append('priority',Number(document.getElementById('ticketPriority').value));
  data.append('status',2);
  if( cc.length > 0) data.append('cc_emails[]',cc);
  
  for(var i = 0, len = filesToUpload.length; i < len; i++) {
    data.append('attachments[]',filesToUpload[i].file);
  }
  
  Promise.all(filePromises)
  .then((fileBlobs) => {
    for(var j=0; j<fileBlobs.length; j++){
      data.append('attachments[]',fileBlobs[i]);
    }
  });
  
  Freshdesk.post('tickets',data, false, function (data) {
    onGetSuccess(data);
  }, function (error) {console.dir(error);});
  
});

var getFile = function ( thisFile) {
  return new Promise((resolve,reject) => {
    var reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(thisFile);
  });
}

var onGetSuccess = function (data) {
  var context = t.getContext();
  
  Trello.post('cards/' + context.card + '/attachments',{name:'Freshdesk Ticket',url:'http://hka-tech.freshdesk.com/support/tickets/' + data.id})
  .then(function(){
    t.closeModal();
  });
}

var onGetFailure = function (data, ticketId) {
    
}

$.fn.fileUploader = function( filesToUpload, sectionIdentifier) {
  var fileIdCounter = 0;
  
  this.closest(".files").change(function(evt) {
    var output = [];
    
    for (var i = 0; i < evt.target.files.length; i++) {
      fileIdCounter++;
      var file = evt.target.files[i];
      var fileId = sectionIdentifier + fileIdCounter;
      
      filesToUpload.push({
        id: fileId,
        file: file
      });
      
      var removeLink = "<a class=\"removeFile\" href=\"#\" data-fileid=\"" + fileId + "\">Remove</a>";
      
      output.push("<li><strong>", escape(file.name), "</strong> - ", file.size, " bytes. &nbsp; &nbsp; ", removeLink, "</li> ");
    }
    $(this).children(".fileList").append(output.join(""));
      
    evt.target.value = null;
  });
  
  $(this).on("click", ".removeFile", function (e) {
    e.preventDefault();
    
    var fileId = $(this).parent().children("a").data("fileid");
    
    for (var i = 0; i < filesToUpload.length; ++i) {
      if (filesToUpload[i].id === fileId)
         filesToUpload.splice(i, 1);
    }
    $(this).parent().remove();
  });
  
  this.clear = function () {
    for (var i = 0; i < filesToUpload.length; ++i) {
      if (filesToUpload[i].id.indexOf(sectionIdentifier) >= 0)
        filesToUpload.splice(i, 1);
    }
    $(this).children(".fileList").empty();
  }
  
  return this;
}