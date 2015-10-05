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
	// this.candidates = vote_data.candidates;
	this.desc = vote_data.desc;
	this.choosers = vote_data.choosers;
    this.create_time = vote_data.create_time;
    this.start_time = vote_data.start_time;
    this.end_time = vote_data.end_time;

}

Vote.prototype._id = null;
Vote.prototype.name = null;
Vote.prototype.anonymity = null;
// Vote.prototype.candidates = null;
Vote.prototype.desc = null;
Vote.prototype.choosers = null;
Vote.prototype.create_time = null;
Vote.prototype.start_time = null;
Vote.prototype.end_time = null;

Vote.prototype.response_obj = function () {
	return {
		name: this.name,
		anonymity: this.anonymity,
		// candidates: this.candidates,
		desc: this.desc,
        create_time : this.create_time,
        start_time : this.start_time,
        end_time : this.end_time
	}
};

Vote.prototype.candidates = function (callback) {
    if (this.vote_candidates != undefined) {
        callback(null, this.vote_candidates);
        return;
    }

    vote_data.candidates_for_vote(
        this.name,
        function (err, results) {
            if (err) {
                console.log("*****\n***** find error!!!!!!");
                callback(err);
                return;
            }
            console.log("************* candidates length:" + results.length);
            var out = [];
            for (var i = 0; i < results.length; i++) {
                console.log("***** deal result:" + results[i]);
                out.push(new Candidate(results[i]));
            }

            this.vote_candidates = out;
            callback(null, this.vote_candidates);
        }
        );
};


function Candidate (candidate_data) {
    this._id = candidate_data._id;
    this.name = candidate_data.name;
    this.desc = candidate_data.desc;
    this.poll = candidate_data.poll;
    this.choosers = candidate_data.choosers;
    this.vote_id = candidate_data.vote_id;
}

Candidate.prototype._id = null;
Candidate.prototype.name = null;
Candidate.prototype.desc = null;
Candidate.prototype.poll = null;
Candidate.prototype.choosers = null;
Candidate.prototype.vote_id = null;

Candidate.prototype.response_obj = function () {
    return {
        name : this.name,
        desc : this.desc,
        poll : this.poll,
        choosers : this.choosers,
        vote_id : this.vote_id
    }
}



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

exports.update_vote_by_name = function (req, res) {
    async.waterfall([
        // update the vote
        function (cb) {
            if (!req.body || !req.body.name) {
                // cb(helpers.)
                return;
            }
            cb(null);
        },

        function (cb) {
            console.log("\n update_vote: " + req.body.name);
            vote_data.update_vote(req.body, cb);
        }],

        function (err, result) {
            if (err) {
                helpers.send_failure(res, err);
            } else {
                console.log("******* update result : " + result);
                // var a = new Vote(results);
                helpers.send_success(res, { "result" : result});
            }
        });
}

exports.candidates_for_vote = function (req, res) {
    // var candidate;
    var vote;
    async.waterfall([
        function (cb) {
            console.log("************\n***** vote_name:" + req.query.vote_name);
            if (!req.query || !req.query.vote_name) {
                cb(helpers.no_such_vote());
            } else {
                vote_data.vote_by_name(req.query.vote_name, cb);
            }
        },

        function (vote_data, cb) {
            if (!vote_data) {
                cb(helpers.no_such_vote());
                return;
            }
            vote = new Vote(vote_data);
            console.log("vote_data ********:" + vote_data);
            console.log("*************** vote.response_obj:" + JSON.stringify(vote.response_obj()));
            vote.candidates(cb);
        },

        function (candidates, cb) {
            var out = [];
            // console.log("******* find " + candidates + "candidate");
            for (var i = 0; i < candidates.length; i++) {
                // console.log("*****" + i + "***** candidate:" + candidates[i] );
                out.push(candidates[i].response_obj());
            }
            cb(null, out);
        }
    ],
    function (err, results) {
        if (err) {
            helpers.send_failure(res, err);
            return;
        }
        if (!results) {
            results = [];
        }
        var out = {
            candidates: results,
            // vote_data: vote.response_obj()
        };
        helpers.send_success(res, out);
    });
};

