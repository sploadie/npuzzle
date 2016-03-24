"use strict"; // so that we can do fun es6 things

const _    = require('underscore');
var engine = require("./board.js");

var read_file = function(filename)	{
	var fs = require("fs");
	try {
	  var data = fs.readFileSync(filename,'utf8');
	} catch (e) {
	  	console.error("File can't be read, we blame you.");
	  	process.exit(1);
	}
  return(data);
};

var convert_integer = function(array, n) {
  var integer_array = array.map(function(element) {
    var split_element = element.split(" ");
    var part_array = []

    for (var i = 0; i < split_element.length; i++) {
      if (isNaN(split_element[i]) || (parseInt(+split_element[i]) != +split_element[i])) {
        console.error("Invalid number me thinks: " + split_element[i]);
        process.exit(1);
      }
      else {
        part_array.push(+split_element[i]);
      }
    }

    if (part_array.length != n) {
      console.error("The number of numbers in each line needs to be the same.");
      process.exit(1);
    }

    return part_array;
  });
  if (integer_array.length != n) {
    console.error("The number of numbers needs to be equal to the number of lines.");
    process.exit(1);
  }
  return (integer_array);
};

var check_number_sequence = function(array, n) {
  var merged = [].concat.apply([], array);
  var sequence = Math.pow(n, 2) - 1;
  for (sequence; sequence >= 0; sequence--) {
    // console.log("Needle: " + sequence);
    for (var i = 0; i < merged.length; i++) {
      if (merged[i] == sequence) {
        // console.log("Haystack: " + merged[i]);
        break;
      }
      if (i == merged.length - 1) {
        console.log("Invalid number sequence");
        process.exit(1);
      }
    }
  }
};

var parse = function(argv) {
	if (argv.length != 3) {
		console.log("One file please: no more, no less.");
		process.exit(1);
	}
	var data = read_file(argv[2]);
	var split_data = data.split("\n");

	// Removes comments from file
 	var array_no_comments = split_data.map(function(num) {
  	if (!num) {
  		return;
  	}
  	num = num.split("#");
  	// removes multiple spaces, g is for global match - ie goes past finding the first match
  	num[0] = num[0].replace(/\s+/g, ' ');
    // trim
    num[0] = num[0].replace(/^\s+|\s+$/g,'');
  	return num[0];
	});

 	// removes any undefined elements from array
	var arrayLength = array_no_comments.length;
	for (var i = 0; i < arrayLength; i++) {
    if (array_no_comments[i] && array_no_comments[i] != '') {
    	array_no_comments.push(array_no_comments[i]);
    }
	}
  array_no_comments.splice(0 , arrayLength);

  // Checking if n value is valid and converting to an integer
 	var n       = array_no_comments.shift();
  if (isNaN(n) || (parseInt(+n) != +n)) {
    console.error("Invalid n value: " + n);
    process.exit(1);
  }
  n = +n;

  // Converts string to integer values. Also checks if integer values are valid and n length is followed on x,y.
 	var npuzzle = _.flatten(convert_integer(array_no_comments, n));

  check_number_sequence(npuzzle, n);
	console.log(n);
	console.log(npuzzle);
	engine.compute(npuzzle, "manhattan_distance");

};

parse(process.argv);
