var express = require('express');
var bodyParser = require('body-parser');  
var helpers = require('./handlers/helpers.js');
var logger = require('morgan');

var app = express();

var db = require('./data/db.js'),
    vote_hdlr = require('./handlers/votes.js'),
    // page_hdlr = require('./handlers/pages.js'),
    candidate_hdlr = require('./handlers/candidates.js');
    helpers = require('./handlers/helpers.js');

app.use(logger('dev'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(bodyParser({ keepExtensions: true }));

// app.get('v1/votes', vote_hdlr.list_all);
app.post('/v1/votes', vote_hdlr.create_vote); // 创建一个投票 
app.get('/v1/votes', vote_hdlr.vote_by_name); // 通过名字查找一个投票
app.post('/v1/delete_votes', vote_hdlr.delete_vote_by_name);
app.post('/v1/update_votes', vote_hdlr.update_vote_by_name);
app.post('/v1/add_candidate', candidate_hdlr.create_candidate);

// 投票
app.post('/v1/cast', candidate_hdlr.choose_candidate); // 给某人投票
app.get('/v1/check_cast',candidate_hdlr.candidate_by_name); // 查询某人投票结果

// app.get("/*",function (req, res) {
// 	res.redirect("/");
// 	res.end();
// });

app.get('*', four_oh_four);

function four_oh_four(req, res) {
    res.writeHead(404, { "Content-Type" : "application/json" });
    res.end(JSON.stringify(helpers.invalid_resource()) + "\n");
};

db.init(function (err, results) {
    if (err) {
        console.error("** FATAL ERROR ON STARTUP: ");
        console.error(err);
        process.exit(-1);
    }

    app.listen(8080);
});