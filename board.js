"use strict"; // so that we can do fun es6 things

var _             = require('underscore');
var PriorityQueue = require('priorityqueuejs');


class Board {
	constructor (str, board_size, moves, previous_move) {
		this.board = [];
		this.board_size = board_size;
    this.moves = moves;
    this.previous_move = previous_move;

		// places board_size arrays into board
		_.times(this.board_size, () => {
			this.board.push([]);
		});

		// puts boardSize values into each array, converts them to integers
		let split = str.split(" ");
		for (let index = 0; index < split.length; index++) {
			this.board[Math.floor(index / board_size)].push(parseInt(split[index], 10));
		}
	}

	board () {
		return(this.board);
	}

  board_size () {
    return(this.board_size);
  }

  moves () {
    return(this.moves);
  }

  hamming_distance () {
		if (this.hamming_distance_cached) {
			return this.hamming_distance_cached;
		}

    var distance = 0;
    for (var z = 0; z < (Math.pow(this.board_size, 2) - 1); z++) {
      if (this.board[Math.floor(z / this.board_size)][z % this.board_size] != (z + 1)) {
        distance++;
      }
    }
    z += 1;
    if (this.board[this.board_size - 1][this.board_size - 1] != 0) {
      distance++;
    }

		this.hamming_distance_cached = distance;
    return distance;
  }

	manhattan_distance () {
		if (this.manhattan_distance_cached) {
			return this.manhattan_distance_cached;
		}

		var sum = 0;
    var x = 0;
    var y = 0;
		for (var index = 0; index < this.board_size; index++) {
			for (var something = 0; something < this.board_size; something++) {
        if (this.board[index][something] == 0) {
          x = Math.abs(index - (this.board_size - 1));
          y = Math.abs(something - (this.board_size - 1));
        }
        else {
          // the formula is where you need to go minus current position, x,y both calculate distance between where we are now and where they need to go
          x = Math.abs(index - Math.floor(((this.board[index][something] - 1 )/ this.board_size)));
          y = Math.abs(something - Math.floor(((this.board[index][something] - 1 ) % this.board_size)));
        }
        sum += x + y
			}
		}

		this.manhattan_distance_cached = sum;
    return sum;
	}

  neighbours () {
    var array_neighbours = [];

    // find where 0 is
		// XXX: can we cache this?
    loop1:
      for (var index = 0; index < this.board_size; index++) {
    loop2:
        for (var something = 0; something < this.board_size; something++) {
          if (this.board[index][something] == 0) {
            break loop1;
          }
        }
      }
    var change_points = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    var new_string = "";
    for (var z = 0; z < change_points.length; z++) {
			// checks if the new point would still be within the boundaries of the game
      if ((change_points[z][0] + index >= 0 &&
							change_points[z][0] + index < this.board_size) &&
					(change_points[z][1] + something >= 0 &&
							change_points[z][1] + something < this.board_size)) {
        // With either the x or y axis, changes around 0 with neighbour and adds to array
        if (change_points[z][0] == 0) {
          new_string = " " + this.tostring() + " ";
          new_string = new_string.replace(/[\s]0[\s]/, " temp ");
          var regex = new RegExp("[\\s]" + this.board[index][something + change_points[z][1]] + "[\\s]");
          new_string = new_string.replace(regex, " 0 ");
          new_string = new_string.replace("temp", this.board[index][something + change_points[z][1]]);
          new_string = new_string.trim();
          // Checks if new neighbour is the same as the previous move
          if (this.previous_move != new_string) {
            array_neighbours.push(new Board(new_string, this.board_size, (this.moves + 1), this.tostring()));
          }
        }
        else {
          new_string = " " + this.tostring() + " ";
          new_string = new_string.replace(/[\s]0[\s]/, " temp ");
          var regex = new RegExp("[\\s]" + this.board[index + change_points[z][0]][something] + "[\\s]");
          new_string = new_string.replace(regex, " 0 ");
          new_string = new_string.replace("temp", this.board[index + change_points[z][0]][something]);
          new_string = new_string.trim();
          // Checks if new neighbour is the same as the previous move
          if (this.previous_move != new_string) {
            array_neighbours.push(new Board(new_string, this.board_size, (this.moves + 1), this.tostring()));
          }
        }
      }
    }
    return(array_neighbours);
  }

	equals (otherBoard) {
		if (this.tostring() === otherBoard.tostring()) {
			return true;
		}
		return false;
	}

	tostring() {
		var string = [];
		// turns array of arrays into an array
		for (var index = 0; index < Math.pow(this.board_size, 2); index++) {
			string.push(this.board[Math.floor(index / this.board_size)][index % this.board_size]);
		}
		string = string.toString();
		string = string.replace(/,/g, " ");
		return(string);
	}

  unsolvable() {
    var inversions = 0;
    var row = 0;
    var array = this.tostring().split(" ");
    // Removing 0 from array
    for (var i = array.length - 1; i >= 0; i--) {
      if (array[i] === '0') {
        row = Math.floor(i / this.board_size);
        array.splice(i, 1);
      }
    }

    for (var x = 0; x < array.length; x++) {
      for (var y = x + 1; y < array.length; y++) {
        if (parseInt(array[x]) > parseInt(array[y])) {
          inversions++;
        }
      }
    }
    // If board size is odd, odd number of inversions means puzzle is unsolvable. Even puzzle inversions plus row is unsolvable if even
    // Returning 1 for unsolvable
    if ((this.board_size % 2) == 1) {
      return (inversions % 2)
    }
    else {
      if ((inversions + row) % 2 == 1) {
        return (0);
      }
      else {
        return (1);
      }
    }
  }
};


function compute (initial_board, answer_board, heuristic) {

  // FIXME: check if initial board is answer
  if (initial_board.unsolvable() == 1) {
        console.error("This puzzle cannot be solved. Infinite loop cancelled.");
        process.exit(1);
    }

	// set up heuristic
	if (!initial_board[heuristic]) {
		throw new Error("invalid heuristic function name");
	}
	// options: ["manhattan_distance", "hamming_distance"]
	var queue = new PriorityQueue(function(a, b) {
    return (b[heuristic]() + b.moves) - (a[heuristic]() + a.moves);
  });

	// keep some statistics
	let max_states_openned = 0;
	let max_states_in_memory = 0;

  queue.enq(initial_board);
  while (true) {
		const size_now = queue.size();
		if (size_now > max_states_in_memory) {
			max_states_in_memory = size_now;
		}

    var current_board = queue.deq();
    var neighbours = current_board.neighbours();
    // console.log(current_board);

    neighbours.forEach(function(neighbour) {
      if (neighbour.equals(answer_board)) {
        console.log("We have a winner!");
        console.log(neighbour);
        process.exit(0);
      } else {
				max_states_openned++;
        queue.enq(neighbour);
      }
    });
    // console.log("------------------------------")
  }


};
// const test1  = new Board("11 6 8 7 5 15 4 3 9 2 12 13 1 14 10 0", 4, 0, 0);
// const test1  = new Board("1 2 3 8 0 4 7 6 5", 3, 0, 0);
// const test1  = new Board("1 2 3 4 12 13 14 5 11 0 15 6 10 9 8 7", 4, 0, 0);
// const test1  = new Board("1 2 3 4 5 16 17 18 19 6 15 24 0 20 7 14 23 22 21 8 13 12 11 10 9", 5, 0, 0);

const test1  = new Board("1 2 3 4 6 7 5 8 0", 3, 0, 0);
// const test1  = new Board("1 2 3 4 6 7 5 8 0", 3, 0, 0);

// const test1  = new Board("2 4 3 5 0 6 7 8 9 10 11 13 1 14 15 12", 4, 0, 0);
// const test1  = new Board("1 2 3 4 5 6 0 8 9 10 7 11 13 14 15 12", 4, 0, 0);
// const test1  = new Board("1 2 3 4 6 7 5 8 0", 3, 0, 0);
// const answer = new Board("1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 0", 4, 0, 0);
const answer = new Board("1 2 3 4 5 6 7 8 0", 3, 0, 0);
// const answer = new Board("1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 19 20 21 22 23 24 0", 5, 0, 0);

// test1.unsolvable();
compute(test1, answer, "manhattan_distance");
// const answer = new Board("1 2 3 4 5 6 7 8 0", 3);
// const test2 = new Board("8 1 3 4 0 6 7 2 5", 3);

// console.log(test2.neighbours());
// console.log(test2.tostring());
// console.log(test0.equals(test1));
