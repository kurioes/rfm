
var rfm_err = require('./rfm_error.js');

// ACL handler ----------------

exports.permissionHandler = function(acl, aco) {
	return function (req, res, next) {
		//console.log("rfm_error::permissionHandler");
		acl.hasPermission(req.rfm_user, aco, function(err, havePermission) {
			//console.log("rfm_error::permissionHandler callback");
			if (err === null) {
				if (havePermission) {
					//console.log("rfm_error::permissionHandler havePermission");
					next();
				} else {
					//console.log("rfm_error::permissionHandler permissionDenied");
					next(new rfm_err.permissionDenied('Access to this resource is not allowed'));
				}
			} else {
				//console.log("rfm_error::permissionHandler internalError");
				next(new rfm_err.internalError());
			}
		});
	}
}

// ACL object ----------------

exports.rfmAcl = rfmAcl;

function rfmAcl(options) {
	options = options || {};
}

rfmAcl.prototype.hasPermission = function(aro, aco, callback) {
	//console.log("rfm_acl::rfmAcl::hasPermission ", aro, aco);
	callback(null, aro === 'user.kurioes' && aco === '/?read');
}

rfmAcl.prototype.existsAro = function(aro, callback) {
	callback(null, aro === 'user.kurioes');
}

rfmAcl.prototype.existsAco = function(aco) {
	callback(null, aco === '/');
}
