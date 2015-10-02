var helpers = require('./helpers.js'),
    vote_data = require("../data/vote.js"),
    async = require('async');

exports.version = "0.1.0";

/**
 * Vote Class
 */
function Vote (vote_data) {
    console.log("vote_data:" + vote_data);
	this._id = vote_data.name;
	this.name = vote_data.name;
	this.anonymity = vote_data.anonymity;
	// this.candidate = vote_data.candidate;
	this.desc = vote_data.desc;
	this.choosers = vote_data.choosers;
}

Vote.prototype._id = null;
Vote.prototype.name = null;
Vote.prototype.anonymity = null;
Vote.prototype.candidates = null;
Vote.prototype.desc = null;
Vote.prototype.choosers = null;

Vote.prototype.response_obj = function () {
	return {
		name: this.name,
		anonymity: this.anonymity,
		candidate: this.candidate,
		desc: this.desc
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
            if (!req.params || !req.params.vote_name)
                cb(helpers.no_such_vote());
            else
                vote_data.vote_by_name(req.params.vote_name, cb);
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