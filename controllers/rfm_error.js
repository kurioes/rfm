
exports.handler = function(err, req, res, next) {
	if (err.rfm_status) {
		//console.log("reached rfm_error::handler ", err);
		res.send(err.rfm_status || 500, err.rfm_name + ': ' + (err.message || ''));
	} else {
		//console.log("rfm_error::handler pussied out on ", err);
		next();
	}
}

exports.notFound = function(msg) {
	var err = new Error(msg);
	err.rfm_name = 'NotFound';
	err.rfm_status = 404;
	return err;
}

exports.permissionDenied = function(msg) {
	var err = new Error(msg);
	err.rfm_name = 'PermissionDenied';
	err.rfm_status = 403;
	return err;
}

exports.internalError = function(msg) {
	var err = new Error(msg);
	err.rfm_name = 'InternalError';
	err.rfm_status = 500;
	return err;
}
