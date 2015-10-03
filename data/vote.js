var local = require('../local.config.js'),
    db = require('./db.js'),
    async = require('async'),
    backhelp = require("./backend_helpers.js"),
    moment = require('moment');

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
		function (vote_data, cb) {
			var write = JSON.parse(JSON.stringify(vote_data));
			console.log("write JSON: " + JSON.stringify(vote_data));
			write._id = vote_data.name;
			write.create_time = moment().format('MMMM-Do-YYYY, hh:mm:ss');
			console.log("write _id: " + write._id);
			db.votes.insert(write, { w: 1, safe: true}, cb);
		},

		function (new_vote, cb) {
            write_succeeded = true;
            final_vote = new_vote.ops[0];
            cb(null);
        }],

		function (err, results) {
			if (err) {
				if (write_succeeded)
					db.albums.remove({ _id: data.name }, function () {});
				if (err instanceof Error && err.code == 11000) {
					console.log("***** vote_already_exists *****");
					callback(backhelp.vote_already_exists());
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

exports.vote_by_name = function (name, callback) {
	console.log("Start find vote : " + name);
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

exports.delete_vote_by_name = function (name, callback) {
	console.log("Start delete vote : " + name);
	db.votes.remove({ _id: name},function (err, result) {
		console.log("***** delete result :" + result);
		callback(err, result);
	});
}

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
