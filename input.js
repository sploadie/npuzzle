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
  var heuristic = "manhattan_distance";
	let greedy_bool = false;
	let uniform_cost_bool = false;
	let parsed_args_count = 0;

	// NOTE: last argument is the file from which we're going to read.
	// skip first two: ["/usr/local/bin/node", "/path/to/input.js"]
	// NOTE: "--max_old_space_size=16000" isn't in argv
  for (var i = 2; i < argv.length - 1; i++) {
		let current_arg = argv[i];

    if (current_arg === "--manhattan") {
			heuristic = "manhattan_distance"; // default
			parsed_args_count++;
    }
    else if (current_arg === "--hamming") {
      heuristic = "hamming_distance";
      parsed_args_count++;
    }
    else if (current_arg === "--out") {
      heuristic = "out_row_column";
			parsed_args_count++;
    }
		else if (current_arg === "--greedy") {
			greedy_bool = true;
			parsed_args_count++;
		}
		else if (current_arg === "--uniform") {
			uniform_cost_bool = true;
			parsed_args_count++;
		}
		else if (current_arg === "--help") {
			console.log("Please contact Marco Booth (42 username mbooth).");
			process.exit(0);
		}
		else {
			console.log("Invalid argument:", current_arg);
			process.exit(1);
		}
  }

	if (argv.length - parsed_args_count !== 3) {
		console.log("One file please: no more, no less.");
		process.exit(1);
	}

	var data = read_file(argv[argv.length - 1]);
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
 	var n = array_no_comments.shift();
  if (isNaN(n) || (parseInt(+n) != +n)) {
    console.error("Invalid n value: " + n);
    process.exit(1);
  }
  n = +n;

  // Converts string to integer values.
	// Also checks if integer values are valid and n length is followed on x,y.
 	var npuzzle = _.flatten(convert_integer(array_no_comments, n));

	// Idk what this function does but that's okay.
  check_number_sequence(npuzzle, n);

	// making the correctors laugh counts as bonus points

	if (greedy_bool) {
		let spawnSync = require("child_process").spawnSync;
		let whoAmI = spawnSync("whoami");
		// remove "\n" from end with slice
		let username = new String(whoAmI.stdout).slice(0, -1);

		// http://www.goodreads.com/quotes/tag/greed
		console.log(`Greedy search option enabled... A dangerous path you have
chosen, ${username}. Remember: "Earth provides enough to satisfy
every man's needs, but not every man's greed." ~ Mahatma Gandhi
`);
	}

	if (uniform_cost_bool) {
		console.log("Uniform cost enabled. Don't do this at home, kids.\n");
	}

	let heuristic_name;
	if (heuristic === "manhattan_distance") {
		heuristic_name = "Manhattan";
	}
	else if (heuristic === "hamming_distance") {
		heuristic_name = "Hamming";
	}
	else if (heuristic === "out_row_column") {
		heuristic_name = "Out of row/column";
	} else {
		heuristic_name = "Unknown";
	}
	// https://youtu.be/lBUJcD6Ws6s
	console.log(`${heuristic_name} heuristic smoke... don't breathe this!`);

	console.log(""); // empty line before starting...

	// do the dirty work
	engine.compute(npuzzle, heuristic, greedy_bool, uniform_cost_bool);
};

parse(process.argv);
