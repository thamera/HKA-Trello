//var fs = require('fs');
//var officegen = require('officegen');
//var docx = officegen('docx');

var controller = function(){};

console.log("I'm here");

controller.prototype = {
  generatedoc : function(request, response) {
    //console.dir(request);
    //const { headers, method, rl } = request;
    //let body = [];
    //request.on('error',(err) => {
    //  console.error(err);
    //}).on('data',(chunk) => {
    //  body.push(chunk);
    //}).on('end',() => {
    //  body = Buffer.concat(body).toString();
    //  response.send(body);
    //});
    response.json({me:'you'});
    //response.json(request);
  }
};

module.exports = new controller();