var helpers = require('./helpers.js'),
    candidate_data = require("../data/candidate.js"),
    async = require('async');

exports.version = "0.1.0";

/**
 * Candidate Class
 */
 /*
 "descs" : "I am Tom.", //候选人描述
        "poll" : "2", //候选人获得票数
        "chooser"*/
function Candidate (candidate_data) {
    this._id = candidate_data._id;
    this.name = candidate_data.name;
    this.desc = candidate_data.desc;
    this.poll = candidate_data.poll;
    this.choosers = candidate_data.choosers;
}

Candidate.prototype._id = null;
Candidate.prototype.name = null;
Candidate.prototype.desc = null;
Candidate.prototype.poll = null;
Candidate.prototype.choosers = null;

Candidate.prototype.response_obj = function () {
    return {
        name : this.name,
        desc : this.desc,
        poll : this.poll,
        choosers : this.choosers
    }
}

exports.create_candidate = function (req, res) {
    var final_candidate;
    var write_succeeded = false;
    async.waterfall([

        function (cb) {

            cb(null);
        },

        function (cb) {
            candidate_data.create_candidate(req.body, cb);
        }],
        function (err, result) {
            if (err) {
                helpers.send_failure(res, err);
            } else {
                var a = new Candidate(result);
                helpers.send_success(res, { candidate: a.response_obj });
            }
        }
        )
}

exports.choose_candidate = function (req, res) {
    async.waterfall([
        function (cb) {
            if (!req.body || !req.body.vote_id || !req.body.name) {
                cb(helpers.no_such_candidate);
            } else {
                var candidate_id = req.body.vote_id + "_" + req.body.name;
                candidate_data.choose_candidate(candidate_id, cb);
            }
        }],
        function (err, result) {
            if (err) {
                helpers.send_failure(res, err);
            } else {
                console.log("******* choose_candidate result: " + result);
                helpers.send_success(res, { "result" : result });
            }
        }
        )
}

exports.candidate_by_name = function (req, res) {
        async.waterfall([
        function (cb) {
            if (!req.query || !req.query.vote_id || !req.query.name) {
                cb(helpers.no_such_candidate);
            } else {
                var candidate_id = req.query.vote_id + "_" + req.query.name;
                console.log("********** candidate_id is: " + candidate_id);
                candidate_data.find_candidate(candidate_id, cb);
            }
        }],
        function (err, result) {
            if (err) {
                helpers.send_failure(res, err);
            } else {
                console.log("******* find_candidate result: " + result);
                helpers.send_success(res, { "result" : result });
            }
        }
        )
}

exports.delete_candidate_by_name = function (req, res) {

}

exports.update_candidate_by_name = function (req, res) {

}