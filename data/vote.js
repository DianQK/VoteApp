var local = require('../local.config.js'),
    db = require('./db.js'),
    async = require('async'),
    backhelp = require("./backend_helpers.js");

exports.version = "0.1.0";

exports.create_vote = function (data, callback) {
	var final_vote;
	var write_succeeded = false;
	async.waterfall([
		// validate data.
		function (cb) {
			cb(null, data);
		},

		// create the vote in mongo
		function function_name (vote_data, cb) {
			var write = JSON.parse(JSON.stringify(vote_data));
			console.log("write JSON: " + JSON.stringify(vote_data));
			write._id = vote_data.name;
			console.log("write _id: " + write._id);
			db.votes.insert(write, { w: 1, safe: true}, cb);
		},

		function (new_vote, cb) {
            write_succeeded = true;
            final_vote = new_vote[0];
            console.log("** create_vote_success.");
            cb(null);
        },

		function (err, results) {
			if (err) {
				callback(err);
			} else {
				callback(err, err ? null : final_vote);
			}
		}
		]);
};

exports.vote_by_name = function (name, callback) {
	console.log("Start find vote name: " + name);
	db.votes.find({ _id: name }).toArray(function (err, results) {
		if (err) {
			callback(err);
			return;
		}
		console.log("Find results: " + results + "length: " + results.length);

		if (results.length == 0) {
			callback(null, null);
		} else if (results.length == 1) {
			callback(null, results[0]);
		} else {
			console.error("More than one vote named:" + name);
			console.error(results);
			callback(backhelp.db_error());
		}
	});
};

// exports.candidates_for_vote = function (vote_name, cn, cs, callback) {
// 	// var sort = { }
// 	db.
// }

exports.all_votes = function (sort_field, sotr_desc, skip, count, callback) {
	var sort = {};
	sort[sort_field] = sotr_desc ? -1 : 1;
	db.votes.find()
	     .sort(sort)
	     .limit(count)
	     .skip(skip)
	     .toArray(callback);
};

function invalid_vote_name() {
	return backhelp.error("invalid_vote_name", "Vote names can have letter, #s, _ and, -");
}
