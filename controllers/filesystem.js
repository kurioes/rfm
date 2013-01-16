var express = require("express");
var app = express();
var path = require("path");
var fs = require("fs");
var async = require("async");

function get_file_meta(filename, callback) {
	fs.lstat(filename, function(err, stat) {
		if (err === null) {
			var ret = null;
			if (stat.isFile() || stat.isDirectory()) {
				ret = new Object();
				ret.name = filename;

				if (stat.isFile()) {
					ret.type = "file";
					ret.size = stat.size;
				} else if (stat.isDirectory()) {
					ret.type = "dir";
				} else {
					ret.type = null;
				}
			}
		}
		callback(err, ret);
	});
}

function durr_butter() {
	var dir = __dirname;
	async.waterfall([
		function(callback){ fs.readdir(dir, callback); },
		function(files, callback){ async.map(files, get_file_meta, callback); }
	],
		function(err, result){
			if (err !== null) console.log("ERROR: ", err);
			console.log(result);
		}
	);
}

function dirlisting(_dir, callback)
{
	_dir = _dir || "/";
	var dir = path.join(__dirname, _dir);

	var result = new Object();
	if (dir.indexOf(__dirname) == 0) {
		result.dir = _dir;
		result.entries = new Array();
		async.waterfall([
			function(acallback){
				fs.readdir(dir, function(err, files) {
					acallback(err, files);
				});
			}
			//,
			//function(files, callback) {
			//	// var stats = stat /@ files;
			//	async.map(files,
			//}
			],
			function(err, files){
				for (i in files) {
					result.entries[i] = new Object();
					result.entries[i].name = files[i];
					result.entries[i].path = path.join(_dir, files[i]);
				}
				var prevDir = path.join(dir, "..");
				if (prevDir.indexOf(__dirname) == 0) {
					result.entries.push({
						name: "..",
						path: path.join(_dir, "..")
					});
				}
				callback(result);
			}
		);
	} else {
		callback("invalid directory");
	}
}

app.use(app.router);

app.use("/public/js", express.static(__dirname + "/public/js"));
app.use("/public/templates", express.static(__dirname + "/public/templates"));

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

app.get("/", function(req, res){
	res.sendfile(__dirname + "/public/html/index.htm");
});

app.listen(3000);

durr_butter();

