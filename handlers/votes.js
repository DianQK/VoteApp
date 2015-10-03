var helpers = require('./helpers.js'),
    vote_data = require("../data/vote.js"),
    async = require('async');

exports.version = "0.1.0";

/**
 * Vote Class
 */
function Vote (vote_data) {
	this._id = vote_data.name;
	this.name = vote_data.name;
	this.anonymity = vote_data.anonymity;
	this.candidate = vote_data.candidate;
	this.desc = vote_data.desc;
	this.choosers = vote_data.choosers;
    this.create_time = vote_data.create_time;
    this.start_time = vote_data.start_time;
    this.end_time = vote_data.end_time;

}

Vote.prototype._id = null;
Vote.prototype.name = null;
Vote.prototype.anonymity = null;
Vote.prototype.candidates = null;
Vote.prototype.desc = null;
Vote.prototype.choosers = null;
Vote.prototype.create_time = null;
Vote.prototype.start_time = null;
Vote.prototype.end_time = null;

Vote.prototype.response_obj = function () {
	return {
		name: this.name,
		anonymity: this.anonymity,
		candidate: this.candidate,
		desc: this.desc,
        create_time : this.create_time,
        start_time : this.start_time,
        end_time : this.end_time
	}
};

// Vote.prototype.candidates = function

exports.create_vote = function (req, res) {
    async.waterfall([
        function (cb) {
            if (!req.body || !req.body.name) {
                cb(helpers.no_such_vote());
                return;
            }
            cb(null);
        },
        function (cb) {
            console.log("\n create_vote: " + req.body.name);
            vote_data.create_vote(req.body, cb);
        }],
        function (err, results) {
            if (err) {
                helpers.send_failure(res, err);
            } else {
                console.log("*******Results : " + results);
                var a = new Vote(results);
                helpers.send_success(res, {vote: a.response_obj()});
            }
        });
}

exports.vote_by_name = function (req, res) {
    async.waterfall([
        // get the vote
        function (cb) {
            if (!req.query || !req.query.name)
                cb(helpers.no_such_vote());
            else
                vote_data.vote_by_name(req.query.name, cb);
        }
    ],
    function (err, results) {
        if (err) {
            helpers.send_failure(res, err);
        } else if (!results) {
            helpers.send_failure(res, helpers.no_such_vote());
        } else {
            var a = new Vote(results);
            helpers.send_success(res, { vote: a.response_obj() });
        }
    });
};

exports.delete_vote_by_name = function (req, res) {
    async.waterfall([
        // get the vote
        function (cb) {
            if (!req.body || !req.body.name)
                cb(helpers.no_such_vote());
            else
                vote_data.delete_vote_by_name(req.body.name, cb);
        }
    ],
    function (err, result) {
        if (err) {
            helpers.send_failure(res, err);
        } else if (result.result.n == 0) {
            helpers.send_failure(res, helpers.no_such_vote());
        } else {
            helpers.send_success(res, { "success" : "delete"});
        }
    });
}