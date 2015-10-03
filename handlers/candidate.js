var local = require('../local.config.js'),
    db = require('./db.js'),
    async = require('async'),
    backhelp = require("./backend_helpers.js"),
    moment = require('moment');

exports.version = "0.1.0";

exports.create_candidate = function (data, callback) {
	var final_candidate;
	var write_succeeded = false;
	async.waterfall([
		// varlidate data.
		function (cb) {
			try {
				backhelp.verify(data, ["name", "vote_id"]);
			} catch (e) {
				cb(e);
				return;
			}
			cb(null, data);
		},

		// create the candidate in mongo
		function (candidate_data, cb) {
			var wirte = JSON.parse(JSON.stringify(candidate_data));
			console.log("write JSON: " + JSON.stringify(candidate_data));
			write._id = candidate_data.vote_id + "_" + candidate_data.name;
			wirte.poll = 0;
			write.chooser = [];
			console.log("write _id: " + write._id);
			db.candidates.insert(write, { w: 1, safe: true}, cb);
		},

		function (new_candidate, cb) {
			write_succeeded = true;
			final_candidate = new_candidate.ops[0];
			cb(null);
		}],

		function (err, result) {
			if (err) {
				if (write_succeeded)
					db.candidates.remove({ _id: candidate_data.vote_id + "_" + candidate_data.name }, function () {});
				if (err instanceof Error && err.code == 11000) {
					console.log("***** candidate_already_exists *****");
					callback(backhelp.candidate_already_exists());
				}
				else if (err instanceof Error && err.errno != undefined)
					callback(backhelp.file_error(err));
				else
					callback(err);
				return;
			} else {
				callback(err, err ? null : final_vote);//WHY !!!!! WTF !!!//final_vote);
			}
		});
};

exports.choose_candidate = function (name, callback) {
	console.log("Start find candidate :" + name);
	db.candidates.find({ _id : ^^^}.toArray(function (err, results) {
		if (err) {
			callback(err);
			return;
		}

		if (result.length == 0) {
			callback(null, null);
		} else if (result.length == 1) {
			callback(null, results[0]);
		} else {
			console.error("More than one candidate: " + name);
			console.error(results);
			callback(backhelp.db_error());
		}
	}))
}
