
exports.authHandler = function() {
	return function (req, res, next) {
		req.rfm_user = 'user.kurioes';
		//console.log("authenticating as: ", req.rfm_user);
		next();
	};
}