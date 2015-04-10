var fs = require('fs');
var path = require('path');

function isPassed(results, logic){
	switch(logic){
		case 'and': return results.indexOf(false) < 0;
		case 'or': return results.indexOf(true) >= 0;
		case '!and': return results.indexOf(false) >= 0;
		case '!or': return results.indexOf(true) < 0;
	}
}

function filterParagraph(paragraph, patterns, logic){
	var results = [];
	patterns.forEach(function(pattern){
		results.push(pattern.test(paragraph))
	});
	return isPassed(results, logic);
}

function filterParagraphs(paragraphs, patterns, logic){
	var results = [];
	if(!paragraphs || paragraphs.length <= 0 || !patterns || patterns.length <= 0){
		return paragraphs;
	}

	paragraphs.forEach(function(paragraph){
		filterParagraph(paragraph, patterns, logic) && results.push(paragraph);
	});
	return results;
}

function getAllSection(data){
	var paragraphPattern = /(?=(\[\d\d?\/\d\d?\/\d\d))\1[\s\S]*?(?=(\[\d\d?\/\d\d?\/\d\d))(?=\2)/ig,
		results = [], result;
	while((result = paragraphPattern.exec(data)) !== null){
		results.push(result[0]);
	}
	return results;
}

function checkFile(file, target){
	fs.readFile(file, 'utf8', function(err, data) {
		var results,
			keyWordPatterns = [
				/error/i, 
				/fail/i, 
				/exception/i, 
				/severe/i,
			],
			ignorePatterns = [
				/USER_ADDL_ATTRBS/,
				/USER_CNTC_INFO/, 

				// Together
				// /responseMessage":"Server side error/,
				// /executeQueryForObject returned too many results/,

					// Not sure
					// /An error occurred while invoking procedure  \[project SpeedPass\]AuthAdapter\/loginFWLSE0100E/,
					// /Failed to parse the payload from backend/,
					// /transactionStatusUpdateResponse\>\<result responseCode="500" status="FAILURE"/,

					// /responseMessage\s*"\s*:\s*"\s*No transaction/,
					// /AuditTrailSql\.saveData-InlineParameterMap/,
					// /Common\.Error\.1008/,
					// /"responseCode":"1008"/,

				/responseCode\s*"\s*:\s*"\s*0000/, 
				/com.exxon.error.ErrorMessage getErrorInfo [\w]+\.[\w]+\.[\d]+/,
				/Validation of the LTPA token failed because/,
				/Authentication failed when using LTPA/,
				/Card authorization failed/,
				/responseMessage":"Password is incorrect/,
				/responseMessage":"Email or password is incorrect/,
				/Unable to respond to any of these challenges/,
			];

		if (err){
			console.log(err);
			throw err;
		}

		results = getAllSection(data);

		for(var i = 0, len = results.length; i < len; i++){
			results[i] = results[i].replace(/verbose_error/, 'verbose_-----');
		}

		console.log(file + 'before check:' + results.length + '\n');
		results = filterParagraphs(results, keyWordPatterns, 'or');
		results = filterParagraphs(results, ignorePatterns, '!or');
		console.log(file + 'after check:' + results.length + '\n');

		for(var i = 0, len = results.length; i < len; i++){
			results[i] = results[i].replace(/verbose_-----/, 'verbose_error');
		}

		fs.writeFile(target + '/' + path.basename(file) + '.txt', results.join(''), function (err) {
			if (err){
				console.log(err);
				throw err;
			}
			// console.log(results.length);
		});
	});
}

// checkFile('SystemOut_15.04.08_03.35.27.log');
exports.checkFile = checkFile;