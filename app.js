var express = require('express');
var app = express();
var path = require('path');
var async = require("async");

function dirlisting(_dir, callback)
{
	var dir = path.join(__dirname, _dir);

	var result = new Object();
	if (dir.indexOf(__dirname) == 0) {
		result.dir = dir;
		result.entries = new Array();
		result.entries[0] = {name: "derp.jpg", meta: "image/jpeg"};
		result.entries[1] = {name: "omg.txt"};
	} else {
		result.error = "invalid directory";
	}

	process.nextTick(function() {
		callback(result);
	});
}

app.use(app.router);

app.use("/js", express.static(__dirname + "/www/js"));
app.use("/templates", express.static(__dirname + "/www/templates"));

app.get("/dir", function(req, res){
	async.waterfall([
		function(callback){
			dirlisting(req.query.path, function(ret) {
				callback(null, ret);
			});
		},
		function(dirlist, callback){
			var stringified = JSON.stringify(dirlist);
			res.send(stringified);
			callback(null);
		}
	]);
});

//app.use('/', express.static(__dirname + '/www/html'));
app.get('/', function(req, res){
	res.sendfile(__dirname + '/www/html/index.htm');
});

app.listen(3000);

