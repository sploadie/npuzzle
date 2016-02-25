

var readfile = function(filename)	{
	var fs = require("fs");
	try {
	  data = fs.readFileSync(filename,'utf8');
	} catch (e) {
	  	console.error("File can't be read, we blame you.");
	  	process.exit(1);
	}
  return(data);
};


var parse = function(argv) {
	if (argv.length != 3) {
		console.log("One file please: no more, no less.");
		process.exit(1);
	}
	var data = readfile(argv[2]);	
	var split_data = data.split("\n");
	
	// Removes comments from file
 	var array_no_comments = split_data.map(function(num) {
  	if (!num) {
  		return;
  	}
  	num = num.split("#");
  	// removes multiple spaces, g is for global match - ie goes past finding the first match
  	num[0] = num[0].replace(/\s+/g, ' ');
  	return num[0];
	});

 	// removes any undefined elements from array
	var arrayLength = array_no_comments.length;
	for (var i = 0; i < arrayLength; i++) {
    if (array_no_comments[i] == undefined) {
    	array_no_comments.splice(i, 1);
    }
	}
  
 	var n       = array_no_comments.shift();
 	var npuzzle = array_no_comments;

 	// go do a bunch of checks


	console.log(n);
	console.log(npuzzle);




};

parse(process.argv);

