var Promise = require('promise'),
	fs = require('fs'),
	path = require('path'),
	mkdir = Promise.denodeify(fs.mkdir),
	close = Promise.denodeify(fs.close),
	open = Promise.denodeify(fs.open);

exports.notExistThenCreateDir = function notExistThenCreateDir(dir, done){
	// Get destination
	var dir = path.isAbsolute(dir) ? dir : process.cwd() + '/' + dir;

	return open(dir, 'r').then(function(fd){
		return close(fd);
	}, function(err){
		if(err.code === 'ENOENT'){
			return mkdir(dir);
		} else{
			throw err;
		}
	}).then(function(){
		done && done();
	}).catch(function(err){
		console.log(err);
		throw err;
	});
}
