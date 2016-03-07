"use strict"; // so that we can do fun es6 things

const _             = require('underscore');
const PriorityQueue = require('priorityqueuejs');

// declare up here so that we're saving on memory
// order is right, down, left, up (needed for computing answer_array)
const possible_moves = [
	{ row_delta: 1, col_delta: 0 },
	{ row_delta: 0, col_delta: 1 },
	{ row_delta: -1, col_delta: 0 },
	{ row_delta: 0, col_delta: -1 },
];

class Board {
	constructor (board_array, moves, answer_map, zero_tile) {
		// NOTE: represented by board_array[row][column]
		this.board_array = board_array;
		this.board_size = board_array.length;

		// just in case
		console.log("this.board_array:", this.board_array);
		_.each(this.board_array, (row) => {
			if (row.length !== this.board_size) {
				console.log("row:", row);
				console.log("this.board_size:", this.board_size);
				throw new Error("not a square");
			}
		});

		if (moves) {
			this.moves = moves;
		} else {
			this.moves = [];
		}

		if (answer_map) {
			this.answer_map = answer_map;
		} else {
			// calculate the answer map from scratch
			this.answer_map = new Array(this.board_size);
			_.times(this.board_size, (value) => {
				this.answer_map[value] = new Array(this.board_size);
			});
			// do the hard work
			let curr_move_index = 0;
			let row = 0;
			let col = 0;
			let before_turning = this.board_size; // # of moves before we need to turn
			let path_index = 1; // index on the current path (starts at 1)
			let second_path = true; // before_turning decreases every 2 paths

			for (let number = 1; number < Math.pow(this.board_size, 2); number++) {
				// set the current number
				this.answer_map[number] = { row, col };

				// if we're going to hit an edge or previously set numbers, turn
				if (path_index === before_turning) {
					// turn right once
					curr_move_index++;
					if (curr_move_index >= possible_moves.length) {
						curr_move_index = 0;
					}

					// reset path and such
					path_index = 0;
					if (second_path) {
						before_turning--;
					}
					second_path = !second_path;
				}

				// move one space
				const curr_move = possible_moves[curr_move_index];
				row += curr_move.row_delta;
				col += curr_move.col_delta;
				path_index++;
			}

			// set the 0 (we already moved so we're in the right place)
			this.answer_map[0] = { row, col };

			console.log("answer_map:");
			_.each(this.answer_map, (value, number) => {
				console.log("number, value:", number, value);
			});
		}

		if (zero_tile) {
			this.zero_tile = zero_tile;

			if (this.board_array[this.zero_tile.row][this.zero_tile.col] !== 0) {
				throw new Error("zero tile not zero");
			}
		} else {
			// find where 0 is
	    findZeroLoop: for (var row = 0; row < this.board_size; row++) {
	      for (var col = 0; col < this.board_size; col++) {
	        if (!this.board_array[row][col]) {
						this.zero_tile = { row, col };
	          break findZeroLoop;
	        }
	      }
	    }

			if (!this.zero_tile) {
				throw new Error("couldn't find zero tile");
			}
		}

		// // places board_size arrays into board
		// _.times(this.board_size, () => {
		// 	this.board_array.push([]);
		// });
		//
		// // puts board_size values into each array, converts them to integers
		// let split = str.split(" ");
		// for (let index = 0; index < split.length; index++) {
		// 	this.board_array[Math.floor(index / board_size)].push(parseInt(split[index], 10));
		// }
	}

	get_board_array () {
		return(this.board_array);
	}

  get_board_size () {
    return(this.board_size);
  }

  get_moves () {
    return(this.moves);
  }

  hamming_distance () {
		if (this.hamming_distance_cached) {
			return this.hamming_distance_cached;
		}

    var distance = 0;
    for (var z = 0; z < (Math.pow(this.board_size, 2) - 1); z++) {
      if (this.board_array[Math.floor(z / this.board_size)][z % this.board_size] != (z + 1)) {
        distance++;
      }
    }
    z += 1;
    if (this.board_array[this.board_size - 1][this.board_size - 1] !== 0) {
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
        if (this.board_array[index][something] === 0) {
          x = Math.abs(index - (this.board_size - 1));
          y = Math.abs(something - (this.board_size - 1));
        }
        else {
          // the formula is where you need to go minus current position, x,y both calculate distance between where we are now and where they need to go
          x = Math.abs(index - Math.floor(((this.board_array[index][something] - 1 )/ this.board_size)));
          y = Math.abs(something - Math.floor(((this.board_array[index][something] - 1 ) % this.board_size)));
        }
        sum += x + y;
			}
		}

		this.manhattan_distance_cached = sum;
    return sum;
	}

  neighbours () {
    var neighbours_array = [];

		const zero_row = this.zero_tile.row;
		const zero_col = this.zero_tile.col;


    _.each(possible_moves, (curr_move) => {
			// don't check if the previous move was the opposite
			if (this.moves.length > 0 &&
					_.isEqual(curr_move, this.moves[this.moves.length - 1])) {
				return;
			}

			// rejects neighbuor if the move would go out of bounds
      if (curr_move.row_delta + zero_row < 0 ||
					curr_move.row_delta + zero_row >= this.board_size ||
					curr_move.col_delta + zero_col < 0 ||
					curr_move.col_delta + zero_col < this.board_size) {
				return;
			}

			// reduce memory as much as possible by reusing the old board's
			// board_array as much as possible
			let new_board_array = this.board_array;

      // with either the x or y axis, changes around the 0 tile for the naybour
      if (curr_move.row_delta === 0) { // horizontal move
				// create a copy of the old board's one line
				let new_line = this.board_array[zero_row].slice(0);

				// do the swap
				const swap_index = zero_col + curr_move.col_delta;
				const temp = new_line[zero_col];
				new_line[zero_col] = new_line[swap_index];
				new_line[swap_index] = temp;

				// swap out that changed line in the board array
				new_board_array[zero_row] = new_line;
      } else { // vertical move
				// create copies of the old board's zero line and dest_line
				// (destination for the zero)
				const dest_line_index = zero_row + curr_move.row_delta;
				let zero_line = this.board_array[zero_row].slice(0);
				let dest_line = this.board_array[dest_line_index].slice(0);

				// do the swap
				const temp = zero_line[zero_col];
				zero_line[zero_col] = dest_line[zero_col];
				dest_line[zero_col] = temp;

				// swap out those changed lines in the board array
				new_board_array[zero_row] = zero_line;
				new_board_array[dest_line_index] = dest_line;
      }

			// create a shallow copy of the moves array for the neighbore
			let new_moves = this.moves.slice(0);
			new_moves.push(curr_move);

			// set up the new zero tile
			const new_zero_tile = {
				row: row + curr_move.row_delta,
				col: col + curr_move.col_delta,
			};

			neighbours_array.push(new Board(new_board_array, new_moves,
					this.answer_map, new_zero_tile));
    });

    return(neighbours_array);
  }

	equals (otherBoard) {
		return _.isEqual(this.board_array, otherBoard.get_board_array());
	}

	toString() {
		// I changed this variable name because it was being highlighted weirdly
		// by Atom.
		var boardString = [];
		// turns array of arrays into an array
		for (var index = 0; index < Math.pow(this.board_size, 2); index++) {
			boardString.push(this.board_array[Math.floor(index / this.board_size)][index % this.board_size]);
		}
		boardString = boardString.toString();
		boardString = boardString.replace(/,/g, " ");
		return(boardString);
	}

  unsolvable() {
    var inversions = 0;
    var row = 0;
    var array = this.toString().split(" ");
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
      return (inversions % 2);
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

	solved () {
		return _.every(this.answer_map, (location, number) => {
			return this.board_array[location.row][location.col] === number;
		});
	}
}


function compute (initial_board, heuristic) {

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

    neighbours.forEach((neighbour) => {
      if (neighbour.solved()) {
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
}
// const test1  = new Board("11 6 8 7 5 15 4 3 9 2 12 13 1 14 10 0", 4, 0, 0);
// const test1  = new Board("1 2 3 8 0 4 7 6 5", 3, 0, 0);
// const test1  = new Board("1 2 3 4 12 13 14 5 11 0 15 6 10 9 8 7", 4, 0, 0);
// const test1  = new Board("1 2 3 4 5 16 17 18 19 6 15 24 0 20 7 14 23 22 21 8 13 12 11 10 9", 5, 0, 0);

// const test1  = new Board("1 2 3 4 6 7 5 8 0", 3, 0, 0);
// const test1  = new Board("1 2 3 4 6 7 5 8 0", 3, 0, 0);

// const test1  = new Board("2 4 3 5 0 6 7 8 9 10 11 13 1 14 15 12", 4, 0, 0);
// const test1  = new Board("1 2 3 4 5 6 0 8 9 10 7 11 13 14 15 12", 4, 0, 0);
// const test1  = new Board("1 2 3 4 6 7 5 8 0", 3, 0, 0);
// const answer = new Board("1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 0", 4, 0, 0);
// const answer = new Board("1 2 3 4 5 6 7 8 0", 3, 0, 0);
// const answer = new Board("1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 19 20 21 22 23 24 0", 5, 0, 0);

// test1.unsolvable();
// compute(test1, answer, "manhattan_distance");
// const answer = new Board("1 2 3 4 5 6 7 8 0", 3);
// const test2 = new Board("8 1 3 4 0 6 7 2 5", 3);

// console.log(test2.neighbours());
// console.log(test2.toString());
// console.log(test0.equals(test1));


module.exports = {
  Board,
	compute,
};

// new Board([[1, 2], [3, 0]]);
// new Board([[1, 2, 3], [4, 5, 6], [7, 8, 0]]);
new Board([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 0]]);
