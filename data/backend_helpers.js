exports.error = function (code, message) {
	var e = new Error(message);
	e.code = code;
	return e;
};

exports.db_error = function () {
    return exports.error("server_error",
        "Something horrible has happened with our database!");
}

exports.vote_already_exists = function () {
    return exports.error(430,
                         "A vote with this name already exists.");
};

// HTTP 状态码 430 资源已存在