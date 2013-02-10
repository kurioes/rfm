var express = require("express");
var app = express();
var rfmAcl = require("./controllers/rfm_acl.js");
var acl = new rfmAcl.rfmAcl();
var filesystem = require("./controllers/rfm_dirlist.js")(__dirname);
var dirlist_service = require("./controllers/rfm_dirlist_service.js")(acl, __dirname, {});

app.use(app.router);

app.use("/public/css", express.static(__dirname + "/public/css"));
app.use("/public/js", express.static(__dirname + "/public/js"));
app.use("/public/templates", express.static(__dirname + "/public/templates"));

app.get("/", function(req, res) {
	res.sendfile(__dirname + "/public/html/index.htm");
});
app.get("/index2.htm", function(req, res) {
	res.sendfile(__dirname + "/public/index.html");
});

app.get("/serve/(*)", function(req, res) {
	filesystem.serve_file(req.params[0], req, res);
});

dirlist_service.setRoutes(app);

app.listen(3000);
console.log("ok");

