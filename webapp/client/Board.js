const DEBUG = true;

function map_to_array(map, board_size) {
	// initialize array
	let array = new Array(Math.pow(board_size, 2));

	// set values in array
	_.each(map, (value, key) => {
		array[value.row * board_size + value.col] = key;
	});

	return array;
}

function inversions(array) {
	var inversions = 0;
	for (var x = 0; x < array.length; x++) {
		for (var y = x + 1; y < array.length; y++) {
			if (parseInt(array[x]) > parseInt(array[y])) {
				inversions++;
			}
		}
	}
	return (inversions);
}

// declare up here so that we're saving on memory
// order is right, down, left, up (needed for computing answer_array)
const possible_moves = [
	{ row_delta: 0, col_delta: 1 },
	{ row_delta: 1, col_delta: 0 },
	{ row_delta: 0, col_delta: -1 },
	{ row_delta: -1, col_delta: 0 },
];

Board = class {
	constructor (board_array, board_size, moves, answer_map, zero_tile) {
		// NOTE: represented by board_array[row * board_size + column]
		this.board_array = board_array;
		this.hash = this.board_array.toString();
		this.board_size = board_size;

		if (DEBUG && Math.pow(this.board_size, 2) !== board_array.length) {
			throw new Error("board size does not match board array length");
		}

		if (moves) {
			this.moves = moves;
		} else {
			this.moves = [];
		}

		if (answer_map) {
			this.answer_map = answer_map;
		} else {
			// calculate the answer map from scratch
			let curr_move_index = 0;
			let row = 0;
			let col = 0;
			let before_turning = this.board_size; // # of moves before we need to turn
			let path_index = 1; // index on the current path (starts at 1)
			let second_path = true; // before_turning decreases every 2 paths

			const map_length = Math.pow(this.board_size, 2);
			this.answer_map = new Array(map_length);

			// do the hard work
			for (let number = 1; number < map_length; number++) {
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

			// console.log("answer_map:");
			// _.each(this.answer_map, (value, number) => {
			// 	console.log("number, value:", number, value);
			// });
		}

		if (zero_tile) {
			this.zero_tile = zero_tile;
			if (DEBUG &&
					this.board_array[this.zero_tile.row * this.board_size +
							this.zero_tile.col] !== 0) {
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

			if (DEBUG && !this.zero_tile) {
				throw new Error("couldn't find zero tile");
			}
		}
	}

	get_hash () {
		return(this.hash);
	}

	get_board_size () {
		return(this.board_size);
	}

	get_moves () {
		return(this.moves);
	}

	hamming_distance () {
		console.log("need to rewrite to use new board_array structure");
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
		let index = 0;
		for (var row = 0; row < this.board_size; row++) {
			for (var column = 0; column < this.board_size; column++) {
				// row - answer[current_number][row/col]
				x = Math.abs(row - this.answer_map[this.board_array[index]].row);
				y = Math.abs(column - this.answer_map[this.board_array[index]].col);
				sum += x + y;
				index++;
			}
		}

		// console.log("this.board_array, sum:", _.flatten(this.board_array), sum);

		this.manhattan_distance_cached = sum;
		return sum;
	}

	neighbours () {
		var neighbours_array = [];

		const zero_row = this.zero_tile.row;
		const zero_col = this.zero_tile.col;
		let curr_move;

		for (let curr_move_index in possible_moves) {
			curr_move = possible_moves[curr_move_index];

			// don't check if the previous move was the opposite
			if (this.moves.length > 0 &&
					curr_move === this.moves[this.moves.length - 1]) {
				continue;
			}

			// rejects neighbuor if the move would go out of bounds
			if (curr_move.row_delta + zero_row < 0 ||
					curr_move.row_delta + zero_row >= this.board_size ||
					curr_move.col_delta + zero_col < 0 ||
					curr_move.col_delta + zero_col >= this.board_size) {
				continue;
			}

			let new_zero_tile = {
				row: zero_row + curr_move.row_delta,
				col: zero_col + curr_move.col_delta,
			};

			let new_board_array = this.board_array.slice(0);
			let zero_tile_index = zero_row * this.board_size + zero_col;
			let new_zero_tile_index = new_zero_tile.row * this.board_size +
					new_zero_tile.col;
			new_board_array[zero_tile_index] = new_board_array[new_zero_tile_index];
			new_board_array[new_zero_tile_index] = 0;

			// create a shallow copy of the moves array for the neighbore
			let new_moves = this.moves.slice(0);
			new_moves.push(curr_move);

			neighbours_array.push(new Board(new_board_array, this.board_size,
					new_moves, this.answer_map, new_zero_tile));
		};

		return(neighbours_array);
	}

	// equals (otherBoard) {
	// 	return _.isEqual(this.board_array, otherBoard.get_board_array());
	// }

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
		var row = 0;
		var array = this.board_array;
		var answer_array = map_to_array(this.answer_map, this.board_size);

		// Removing 0 from array
		for (var i = array.length - 1; i >= 0; i--) {
			if (array[i] === '0') {
				row = Math.floor(i / this.board_size); // technically this.zero.row
				array.splice(i, 1);
			}
		}
		// Shouldn't matter that 0 has not been spliced from goal array, it has no effect no inversion number
		var goal_inversions = inversions(array);
		var curr_inversions = inversions(answer_array);

		// If board size is odd, odd number of inversions means puzzle is unsolvable. Even puzzle inversions plus row is unsolvable if even
		// Returning 1 for unsolvable
		if (this.board_size % 2 == 0) { // In this case, the row of the '0' tile matters
				curr_inversions += array.indexOf(0) / this.board_size;
				goal_inversions += answer_array.indexOf(0) / this.board_size;
		}

		return (curr_inversions % 2 == goal_inversions % 2);
	}

	solved () {
		return _.every(this.answer_map, (location, number) => {
			return this.board_array[location.row * this.board_size + location.col]
					=== number;
		});
	}
}
