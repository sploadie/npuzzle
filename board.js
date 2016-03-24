"use strict"; // so that we can do fun es6 things

const _             = require('underscore');
const PriorityQueue = require('priorityqueuejs');
const Sleep         = require('sleep');

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
  { row_delta:  0, col_delta:  1 },
  { row_delta:  1, col_delta:  0 },
  { row_delta:  0, col_delta: -1 },
  { row_delta: -1, col_delta:  0 },
];
const human_moves = [
  'slideLEFT',
  'slideUP',
  'slideRIGHT',
  'slideDOWN',
];

class Board {
  constructor (board_array, board_size, moves, answer_map, zero_tile) {
    // NOTE: represented by board_array[row * board_size + column]
    this.board_array = board_array;
    this.hash = this.board_array.toString();
    this.board_size = board_size;

    if (Math.pow(this.board_size, 2) !== board_array.length) {
      throw new Error("board size does not match board array length");
    }

    if (moves) {
      this.moves = moves;
    } else {
      this.moves = [];
    }
    // this.move_count = this.moves.length

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
      //  console.log("number, value:", number, value);
      // });
    }

    if (zero_tile) {
      this.zero_tile = zero_tile;
      if (this.board_array[this.zero_tile.row * this.board_size +
              this.zero_tile.col] !== 0) {
        throw new Error("zero tile not zero");
      }
    } else {
      // find where 0 is
      findZeroLoop: for (var row = 0; row < this.board_size; row++) {
        for (var col = 0; col < this.board_size; col++) {
          if (this.board_array[row * this.board_size + col] == 0) {
            this.zero_tile = { row, col };
            break findZeroLoop;
          }
        }
      }

      if (!this.zero_tile) {
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
    let prev_move;

    for (let curr_move_index in possible_moves) {
      curr_move = possible_moves[curr_move_index];

      // don't check if the previous move was the opposite
      if (this.moves.length > 0) {
        prev_move = this.moves[this.moves.length - 1];
        if (prev_move.row_delta + curr_move.row_delta == 0 && prev_move.col_delta + curr_move.col_delta == 0) {
          // console.log('check:', curr_move, 'opposite of', prev_move);
          // process.exit(0);
          continue;
        }
      }

      // rejects neighbour if the move would go out of bounds
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
  //  return _.isEqual(this.board_array, otherBoard.get_board_array());
  // }

  toString() {
    // I changed this variable name because it was being highlighted weirdly
    // by Atom.
    // var boardString = this.board_array + '';
    // boardString = '[ ' + boardString.replace(/,/g, ', ') + ' ]';
    // return(boardString);
    var board = this.board_array.slice(0);
    var boardString = '@= Board =@\n';
    while (board.length > this.board_size) {
      boardString += board.slice(0, this.board_size) + '\n';
      board = board.slice(this.board_size);
    }
    boardString += board + '\n@= ===== =@';
    return(boardString.replace(/,/g, ' '));
  }

  movesString() {
    var moves = 'Move Count: ' + this.moves.length + '\nMoves:\n'
    moves += this.moves.map(function(move) {
      return (human_moves[possible_moves.indexOf(move)]);
    }).join('\n');
    return (moves);
  }

  isBroken() {
    var board = this.board_array.slice().sort();
    for (var i = 0; i < this.board_size - 1; i++) {
      if (board[i + 1] == board[i]) {
        return (true);
      }
    }
    return (false);
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


function compute (initial_array, heuristic) {
  let board_size = parseInt(Math.sqrt(initial_array.length));
  var initial_board = new Board(initial_array, board_size);
  console.log('### INITIAL BOARD ###', '\n' + initial_board.toString(), '\n\n### SOLUTION ###');

  if (initial_board.isBroken()) {
    console.log("This puzzle is broken. Nice try.");
    process.exit(0);
  }
  if (initial_board.solved()) {
    console.log("This one was solved before we even began trying - " +
        "we're going to be honest and take no credit for this one.");
    process.exit(0);
  }
  if (!initial_board.unsolvable()) {
    console.error("This puzzle cannot be solved. Infinite loop cancelled.");
    process.exit(1);
  }

  // set up heuristic
  if (["manhattan_distance", "hamming_distance"].indexOf(heuristic) === -1) {
    throw new Error("invalid heuristic function name");
  }
  var queue = new PriorityQueue(function(a, b) {
    // console.log(`${heuristic}:`, b[heuristic]());
    return (b[heuristic]() + b.get_moves().length) - (a[heuristic]() + a.get_moves().length);
  });

  // keep some statistics
  let total_states_opened = 0;
  let max_states_in_memory = 0;
  let seen_hashes = {};
  let queue_priorities;

  queue.enq(initial_board);
  while (queue.size() > 0) {
    const size_now = queue.size();
    if (size_now > max_states_in_memory) {
      max_states_in_memory = size_now;
      if (max_states_in_memory % 100000 === 0) {
        console.log(`Total States Opened: ${total_states_opened}\tMax Ever in Queue: ${max_states_in_memory}`);
      }
    }

    var current_board = queue.deq();
    // if (current_board.isBroken() == true) {
    //   console.log(current_board.toString(), 'Queue Size:', queue.size());
    //   console.log('Board broke!');
    //   process.exit(1);
    // }
    // console.log(current_board.toString(), 'Queue Size:', queue.size());
    // Sleep.sleep(0.5);

    // // DEBUG
    // console.log(`current_board priority:`, current_board[heuristic]() + current_board.get_moves().length);
    // queue_priorities = [];
    // queue.forEach(function(board) {
    //   queue_priorities.push(board[heuristic]() + board.get_moves().length)
    // });
    // console.log(`queue priorities:`, queue_priorities + '');
    // // process.exit(0);
    // Sleep.sleep(0.5);
    // // DEBUG

    // shuffle nayboorz because otherwise we'll make a disproportionate
    // number of moves in the same direction
    var neighbours = _.shuffle(current_board.neighbours());

    neighbours.forEach((neighbour) => {
      let hash = neighbour.get_hash();
      let moves = neighbour.get_moves();
      if (seen_hashes[hash] &&  seen_hashes[hash] <= moves.length) {
        // console.log('hash clash: ', seen_hashes[hash], "+ '' ==", moves, "+ ''");
        // process.exit(0);
        return;
      }
      seen_hashes[hash] = moves.length;

      if (neighbour.solved()) {
        console.log("We have a winner!");
        console.log(neighbour.toString());
        console.log(neighbour.movesString());
        console.log("Total States Opened: " + total_states_opened);
        console.log("Maximum States Ever in Queue: " + max_states_in_memory);

        process.exit(0);
        return;
      }

      total_states_opened++;
      if (total_states_opened % 100000 === 0) {
        console.log(`states opened: ${total_states_opened}\tmax in memory: ${max_states_in_memory}`);
        // console.log(current_board.toString());
      }
      // if (total_states_opened % 100 === 0) {
      //   Sleep.sleep(0.5);
      // }

      if (neighbour.isBroken() == true) {
        console.log(neighbour.toString(), 'Last Move:', moves[0]);
        console.log('Board broke!');
        process.exit(1);
      }
      queue.enq(neighbour);
    });
  }

  throw new Error("Couldn't solve :(");
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
// var hello = new Board([[1, 2, 3], [7, 0, 4], [8, 6, 5]]);
// var hello = new Board([[1, 2, 3], [4, 5, 6], [7, 8, 0]]);
// var hello = new Board([[0, 2, 3, 1], [5, 6, 7, 8], [9, 10, 11, 15], [13, 14, 12, 4]]);
// compute(hello, 0);
// new Board([[1, 2], [3, 0]]);
// var hello = [[6, 2, 0], [4, 1, 7], [5, 3, 8]];
// var hello = [[1, 2, 3], [0, 8, 4], [7, 6, 5]];
// var hello = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];
// var hello = new Board([[0, 2, 3, 1], [5, 6, 7, 8], [9, 10, 11, 15], [13, 14, 12, 4]]);
// hello.neighbours();
// compute(hello, 0);
