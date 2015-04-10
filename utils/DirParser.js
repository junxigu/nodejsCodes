var fs = require('fs');
var Promise = require('promise');

var allFiles = [];
var subDirs = [];

function readDir(dir){
	return new Promise(function(resolve, reject){
		fs.readdir(dir, function(err, files){
			if(err){
				console.log(err);
				reject(err);
			} else{
				resolve(files);
			}
		});
	});
}

function statFile(file){
	return new Promise(function(resolve, reject){
		fs.stat(file, function(err, stats){
			if(err){
				console.log(err);
				reject(err);
			} 
			else{
				resolve({
					file: file,
					stats: stats,
				});
			}
		});
	});
}

function walk(dir){
	subDirs.push(dir);

	return readDir(dir).then(function(files){
		return files.map(function(file){
			return statFile(dir + '/' + file);
		}).reduce(function(sequence, statPromise){
			return sequence.then(function(){
				return statPromise;
			}).then(function(statsObj){
				var stats = statsObj.stats,
					file = statsObj.file;
				if(stats && stats.isDirectory()){
					return walk(file);
				} else if(stats && stats.isFile()){
					allFiles.push(file);
				}
			});
		}, Promise.resolve());
	});
}

function DirParser(){
}

DirParser.prototype.parse = function(dir, done){
	walk(dir).then(function(){
		done && done({
			dirs: subDirs,
			files: allFiles,
		});
	}, function(err){
		console.log(err);
		throw err;
	});
}

// var parser = new DirParser();
// parser.parse('C:/Users/IBM_ADMIN/Desktop/test', function(result){
// 	console.log(result);
// });

exports.DirParser = DirParser;