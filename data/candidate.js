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
			// try {
			// 	backhelp.verify(name, ["name"]);
			// } catch (e) {
			// 	cb(e);
			// 	return;
			// }
			// console.log("******** ***** create candidate name:" + name);
			cb(null, data);
		},

		// create the candidate in mongo
		function (data, cb) {
			// var write = JSON.parse(JSON.stringify(candidate_data));
			// console.log("write JSON: " + JSON.stringify(candidate_data));
			var write  = JSON.parse("{}");
			write._id = data.vote_id + "_" + data.name;//vote_id + "_" + candidate_name;
			write.name = data.name; //candidate_data.name;
			write.vote_id = data.vote_id;
			write.poll = 0;
			write.chooser = [];
			console.log("write candidate _id: " + write._id);
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
					callback(backhelp.candidate_already_exists());
				}
				else if (err instanceof Error && err.errno != undefined)
					callback(backhelp.file_error(err));
				else
					callback(err);
				return;
			} else {
				callback(err, err ? null : final_candidate);
			}
		});
};

exports.choose_candidate = function (_id, callback) {

	var update_succeeded = false;
	async.waterfall([
		// validate data.
		function (cb) {
			// try {
			// 	backhelp.verify(data,
			// 		[ "name", ""]);
			// 	console.log("Start choose candidate :" + _id);
			// } catch (e) {
			// 	cb(e);
			// 	return;
			// }
			// cb(null, data);
			console.log("****** choose_candidate _id: " + _id);
			db.candidates.find( { _id: _id} ).toArray(function (err, results) {
				if (err) {
					callback(err);
					return;
				}
				console.log("Find results: " + results + "length: " + results.length);
				if (results.length == 0) {
					callback(null, null);
				} else if (results.length == 1) {
					// callback(null, results[0]);
					cb(null, results[0]);
				} else {
					console.error("More than one vote named:" + name);
					console.error(results);
					callback(backhelp.db_error());
				}
			});
		},

		// create the vote in mongo
		function (candidate, cb) {
			// var update = JSON.parse(JSON.stringify(vote_data.update_data));
			// console.log("update JSON: " + JSON.stringify(update));
			// var _id = new db.bson_serializer.ObjectID(vote_data.name);//vote_data.name;
			// update.update_time = moment().format('MMMM-Do-YYYY, hh:mm:ss');
			// console.log("update _id: " + _id);
			console.log("************ update _id: " + JSON.stringify(candidate));
			var update = JSON.parse(JSON.stringify(candidate));
			update.poll += 1;
			db.candidates.update( { _id: candidate._id }, { $set: { poll: update.poll } }, { w: 1, safe: true}, cb);
		}],

		function (err, result) {
			if (err) {
				callback(err);
			} else {
				callback(err, err ? null : result);
			}
		});
}

exports.find_candidate = function (candidate_id, callback) {
		console.log("Start find candidate : " + candidate_id);
	db.candidates.find({ _id: candidate_id }).toArray(function (err, results) {
		if (err) {
			callback(err);
			return;
		}
		console.log("++++++ Find results: " + results + "length: " + results.length);

		if (results.length == 0) {
			callback(null, null);
		} else if (results.length == 1) {
			callback(null, results[0]);
		} else {
			console.error("More than one vote named:" + candidate_id);
			console.error(results);
			callback(backhelp.db_error());
		}
	});
}


