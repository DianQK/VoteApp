var local = require('../local.config.js'),
    db = require('./db.js'),
    async = require('async'),
    backhelp = require("./backend_helpers.js"),
    moment = require('moment'),
    candidate = require('./candidate.js');

exports.version = "0.1.0";

exports.create_vote = function (data, callback) {
	var final_vote;
	var write_succeeded = false;
	async.waterfall([
		// validate data.
		function (cb) {
			try {
				backhelp.verify(data,
					[ "name", "anonymity"]);
				// if (!backhelp.valid_candidate(data.candidates)) 
				// 	throw invalid_vote_candidate();
			} catch (e) {
				cb(e);
				return;
			}
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
            // for (var i = 0; i < data.candidates.length; i++) {
            // 	console.log("********* loop candidates:" + data.candidates[i]);
            // 	candidate.create_candidate(data.name, data.candidates[i], cb);
            // };
            // for (candidate_name in data.candidates) {
            // 	candidate.create_candidate(data.name, candidate_name, cb);
            // 	console.log("***************  create_candidate   *******" + candidate_name);
            // }
            cb(null);
        }],

		function (err, result) {
			if (err) {
				if (write_succeeded)
					db.votes.remove({ _id: data.name }, function () {});
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
				callback(err, err ? null : final_vote);
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

exports.candidates_for_vote = function (vote_name, callback) {
	var sort = { poll: -1 };
	console.log("****** ***** ***** vote_id ****** ***:" + vote_name);
	db.candidates.find({ vote_id: vote_name })
	     .sort(sort)
	     .toArray(callback);
};

exports.delete_vote_by_name = function (name, callback) {
	console.log("Start delete vote : " + name);
	db.votes.remove({ _id: name},function (err, result) {
		console.log("***** delete result :" + result);
		callback(err, result);
	});
};

exports.update_vote = function (data, callback) {
	// var final_vote;
	// var vote_name;
	var update_succeeded = false;
	async.waterfall([
		// validate data.
		function (cb) {
			try {
				backhelp.verify(data,
					[ "name", "update_data"]);
			} catch (e) {
				cb(e);
				return;
			}
			cb(null, data);
		},

		// create the vote in mongo
		function (vote_data, cb) {
			var update = JSON.parse(JSON.stringify(vote_data.update_data));
			console.log("update JSON: " + JSON.stringify(update));
			// var _id = new db.bson_serializer.ObjectID(vote_data.name);//vote_data.name;
			update.update_time = moment().format('MMMM-Do-YYYY, hh:mm:ss');
			// console.log("update _id: " + _id);
			db.votes.update( { _id: vote_data.name }, { $set: update}, { w: 1, safe: true}, cb);
		}],

		function (err, result) {
			if (err) {
				callback(err);
			} else {
				callback(err, err ? null : result);
			}
		});
}



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

function invalid_vote_candidate() {
	return backhelp.error(400,"candidate must > 1");
}
