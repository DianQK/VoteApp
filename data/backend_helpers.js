exports.verify = function (data, field_names) {
    for (var i = 0; i < field_names.length; i++) {
        if (!data[field_names[i]]) {
            throw exports.error(400,
                                field_names[i] + " not optional");
        }
    }

    return true;
}

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

exports.candidate_already_exists = function () {
    return exports.error(430, "A candidate with this name already exists in this vote");
}

exports.valid_candidate = function (fn) {
    if (Array.isArray(fn)) {
        if (fn.length > 1) 
            return true;
        else 
            return false;
    } else {
        console.log("************ valid_candidate false");
        return false;
    }
};

// HTTP 状态码 430 资源已存在