// server.js
// where your node app starts

// init project
var cors = require('cors');
var express = require('express');
var path = require('path');
var api = require('./routes/api');
var auth = require('./routes/auth');

var router = express.Router();

var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
app.use(cors({origins:'*'}));


// http://expressjs.com/en/starter/static-files.html
app.use(express.static(path.join(__dirname,'public')));

app.use('/api',api);
app.use('/auth',auth);
//app.use('/',routes);

// http://expressjs.com/en/starter/basic-routing.html
//app.get("/", function (request, response) {
//  response.sendFile(__dirname + '/views/index.html');
//});

//app.get("/dreams", function (request, response) {
//  response.send(dreams);
//});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
//app.post("/dreams", function (request, response) {
//  dreams.push(request.query.dream);
//  response.sendStatus(200);
//});

// Simple in-memory store for now
//var dreams = [
//  "Find and count some sheep",
//  "Climb a really tall mountain",
//  "Wash the dishes"
//];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
