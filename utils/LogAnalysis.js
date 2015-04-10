var checkFile = require('./CheckLogFile.js').checkFile,
	DirParser = require('./DirParser.js').DirParser,
	DirUtil = require('./DirUtil'),
	fs = require('fs'),
	path = require('path'),
	src = process.argv[2],
	dst;

if(!src){
	console.log('Lack of Parameters: <Usage: node LogAnalysis.js src [dst]>\n');
	console.log('\t src: source directory of log files.\n');
	console.log('\t dst: optional, destination directory of result files.\n');
} else{
	dst = process.argv[3] || path.join(src, '/../target');
	dst = path.isAbsolute(dst) ? dst : process.cwd() + '/' + dst; 
	
	DirUtil.notExistThenCreateDir(dst, function(){
		(new DirParser()).parse(src, function(result){
			result.files.forEach(function(file){
				checkFile(file, dst);
			});
		});
	});
}

