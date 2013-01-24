
var path = require("path");
var fs = require("fs");
var async = require("async");

exports = module.exports = createFilesystem;

function createFilesystem(rootdir) {
	return new filesystem(rootdir);
}

function filesystem(rootdir) {
	this.rootdir = rootdir;
}

/*
filesystem.prototype._meta_entry_types = Object.freeze({
	"dir":  0,
	"file": 1
});
*/
filesystem.prototype._get_meta_data = function(dir, filename, callback) {
	fs.lstat(path.join(dir, filename), function(err, stat) {
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

filesystem.prototype._get_files_metadata = function(dir, filenames, callback) {
	async.map(
		filenames,
		function(filename, map_callback) {
			this._get_meta_data(dir, file, map_callback);
		},
		callback
	);
}
/*
filesystem.prototype._meta_entry_cmp = function(a, b) {
	var ret = this._meta_entry_types[a.type] - this._meta_entry_types[b.type];
	if (ret !== 0)
		return ret;
	ret = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
	if (ret !== 0)
		return ret;
	ret = a.name.localeCompare(b.name);
	return ret;
}*/

/*
filesystem.prototype._remove_invalid_entries = function(files_metadata, callback) {
	async.reject(
		files_metadata,
		function(file_metadata, reject) {
			if (file_metadata === null) {
				return reject(true);
			} else {
				return reject(file_metadata.type === null);
			}
		},
		function(ret) {
			callback(null, ret);
		});		
}*/

filesystem.prototype._split_and_add_path = function(metadata, rel_dir, callback) {
	files = [];
	dirs = [];
	for (i = 0; i < metadata.length; i ++) {
		metadata[i].path = path.join(rel_dir, metadata[i].name);
		if (metadata[i].type === "file") {
			files.push(metadata[i]);
		} else if (metadata[i].type === "dir") {
			dirs.push(metadata[i]);
		}
	}
	callback(null, {"dirs": dirs, "files": files})
}

filesystem.prototype.ls = function(rel_dir, callback) {	
	rel_dir = path.join("/", rel_dir || "/");
	var abs_dir = path.join(this.rootdir, rel_dir);
	var _fs = this;

	var result = new Object();
	if (abs_dir.indexOf(this.rootdir) == 0) {
		result.dir = path.join("/", rel_dir);

		var prevDir = path.join(abs_dir, "..");
		if (prevDir.indexOf(this.rootdir) == 0){
			result.parentdir = path.join("/", rel_dir, "..");
		}

		async.waterfall([
			// get directory contents
			function(acallback) {
				fs.readdir(abs_dir, function(err, files) {
					acallback(err, files);
				});
			},
			// get contents metadata
			function(files, acallback) {
				async.map(files, function(file, mapcallback) {
						_fs._get_meta_data(abs_dir, file, mapcallback);
					}, acallback);
			},
			// filter out contents that aren't files or directories
			// also, put files in result.files and firs in result.dirs
			function(metadata, acallback) {
				_fs._split_and_add_path(metadata, rel_dir, acallback);
			}
			],
			function(err, metadata) {
				if (err === null) {
					// put metadata in result after adding the file's paths
					result.files = metadata.files;
					result.dirs = metadata.dirs;
				}
				if (err !== null) {
					result = null;
				}
				callback(err, result);
			}
		);
	} else {
		callback("invalid directory", null);
	}
}

filesystem.prototype.serve_file = function(rel_path, req, res) {
	var abs_path = path.join(this.rootdir, rel_path);
	fs.exists(
		abs_path,
		function(exists) {
			if (exists) {
				res.sendfile(abs_path);
			} else {
				res.status(404);
				res.send("404 File Not Found");
			}
		}
	);
}

