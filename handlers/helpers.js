exports.version = '0.1.0';

exports.send_success = function (res, data) {
	res.writeHead(200, {"Content-Type": "application/json"});
	var output = { error: null, data: data};
	res.end(JSON.stringify(output) + "\n");
};

exports.send_failure = function (res, err) {
	console.log("\n ************* Error : " + err);
	var code = (err.code) ? err.code : err.name;
	res.writeHead(code, {"Content-Type" : "application/json"});
	res.end(JSON.stringify({error: code, message: err.message}) + "\n");
};

exports.error = function (code, message) {
	var e = new Error(message);
	e.code = code;
	return e;
};

exports.no_such_vote = function () {
	return exports.error(404, "The specified vote does not exist.");
}

exports.invalid_resource = function () {
    return exports.error(404,
                         "The requested resource does not exist.");
};