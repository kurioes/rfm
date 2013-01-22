var express = require("express");
var app = express();
//var path = require("path");
//var fs = require("fs");
//var async = require("async");
var filesystem = require("./controllers/filesystem.js")(__dirname);

app.use(app.router);

app.use("/public/js", express.static(__dirname + "/public/js"));
app.use("/public/templates", express.static(__dirname + "/public/templates"));

app.get("/", function(req, res) {
	res.sendfile(__dirname + "/public/html/index.htm");
});

app.get(/^\/list\/(.*)/, function(req, res) {
	filesystem.ls(req.params[0], function(err, ret) {
		res.send(ret);
	});
});

app.get(/^\/serve\/(.*)/, function(req, res) {
	filesystem.serve_file(req.params[0], req, res);
});

app.listen(3000);
console.log("ok");

