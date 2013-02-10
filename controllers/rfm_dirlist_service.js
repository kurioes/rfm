
var dirLister	= require("./rfm_dirlist.js");
var err 		= require("./rfm_error.js");
var rfm_acl		= require('./rfm_acl.js');
var rfm_auth	= require("./rfm_auth.js");
var Mustache 	= require('mustache');

exports = module.exports = rfm_createDirlistService;

// constructor -----------

function rfm_createDirlistService(acl, rootdir, options) {
	options = options || {};
	return new rfm_dirlistService(acl, rootdir, options);
}

function rfm_dirlistService(acl, rootdir, options) {
	this.acl = acl;
	this.rootdir = rootdir;
	this.dirservice = new dirLister(rootdir);
	this.rooturl = '/services/dir';
	if (options.rooturl) {
		this.rooturl = options.rooturl;
	}
}

// services --------------

rfm_dirlistService.prototype.dirList = function(req, res) {
	//console.log("rfm_dirlistService::dirList");
	this.dirservice.ls(req.params.path, function(err, data) {
		//console.log("rfm_dirlistService::dirList returned err", err, " data=", data);
		sendresult(req.params.type, err, data, req, res);
	});
}

rfm_dirlistService.prototype.dirListDirsForAutocomplete = function(req, res) {
	this.dirservice.ls_autocomplete_dirs(req.params.path, function(err, data) {
		sendresult(req.params.type, err, data, req, res);
	});
}

// routes -----------

rfm_dirlistService.prototype.setRoutes = function(app) {
	var authHandler = rfm_auth.authHandler();
	app.get(this.rooturl + '/*', authHandler);

	this.connect(app, 'get', '/?read', '/list/:type(html|json):path(*)', 'dirList', 'dirlist-dumb-view.mustache.htm');
	this.connect(app, 'get', '/?read', '/autocomplete:path(*)', 'dirListDirsForAutocomplete');

	app.use(this.rooturl, err.handler);
}

// convenience function

rfm_dirlistService.prototype.connect = function(app, method, aco, url, functionname, template) {
	var self = this;
	var fn = app[method];
	fn.call(
		app,
		this.rooturl + url,
		rfm_acl.permissionHandler(this.acl, aco),
		function(req, res) {
			if (template) {
				res.rfm_template = '/public/template/' + template;
			}
			self[functionname].call(self, req, res);
		});
}

// utility functions -----------

function methodify(type, data, res, callback) {
	//console.log("::methodify type=", type, " data=", data, " template=", template);
	if (type === 'json' || type === undefined) {
		res.setHeader('Content-Type', 'application/json');
		callback(null, JSON.stringify(data));
	} else if (res.rfm_template) {
		res.setHeader('Content-Type', 'text/html');
		//Mustache.to_html('<html><head></head><body><p>{{dir}}</p></body></html>', data);
		callback(null, Mustache.to_html('<html><head></head><body><p>{{dir}}</p></body></html>', data));
	} else {
		throw new exports.notFound('html output not possible for service');
	}
}

function sendresult(type, pre_err, data, req, res) {
	//console.log("::sendresult");
	if (pre_err === null) {
		methodify(type, data, res, function(err, renderedData) {
			//console.log("::sendresult (methodify callback)");
			if (err === null) {
				res.send(renderedData);
			} else throw new Error(err);
		});
	} else {
		throw new err.internalError(pre_err);
	}
}
