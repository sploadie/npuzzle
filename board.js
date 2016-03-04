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
    this.distance = this.manhattan_distance();
	}

	board () {
		return(this.board);
	}

	manhattan_distance () {
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
    return sum;
	}

  // Yes, that is the correct spelling
	// Fine.
  neighbours () {
    var array_neighbours = [];
    // find where 0 is
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
    // First checks if the new point would still be within the boundaries of the game
    for (var z = 0; z < change_points.length; z++) {
      if ((change_points[z][0] + index >= 0 && change_points[z][0] + index < this.board_size) && (change_points[z][1] + something >= 0 && change_points[z][1] + something < this.board_size)) {
        // With either the x or y axis, changes around 0 with neighbour and adds to array
        if (change_points[z][0] == 0) {
          new_string = this.tostring();
          new_string = new_string.replace(/0/, "temp");
          new_string = new_string.replace(this.board[index][something + change_points[z][1]], 0);
          new_string = new_string.replace("temp", this.board[index][something + change_points[z][1]]);
          if (this.previous_move != new_string) {
            array_neighbours.push(new Board(new_string, 3, (this.moves + 1), this.tostring()));
          }
        }
        else {
          new_string = this.tostring();
          new_string = new_string.replace(/0/, "temp");
          new_string = new_string.replace(this.board[index + change_points[z][0]][something], 0);
          new_string = new_string.replace("temp", this.board[index + change_points[z][0]][something]);
          if (this.previous_move != new_string) {
            array_neighbours.push(new Board(new_string, 3, (this.moves + 1), this.tostring()));
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
};


var compute = function(initial_board, answer_board) {

  // FIXME: check if initial board is answer
  var queue = new PriorityQueue(function(a, b) {
    return b.manhattan_distance() - a.manhattan_distance();
  });

  var answer = 0;
  queue.enq(initial_board);
  while (answer != 1) {
    var current_board = queue.deq();
    var neighbours = current_board.neighbours();
    console.log(current_board);

    neighbours.forEach(function(neighbour) {
      if (neighbour.equals(answer_board)) {
        console.log("We have a winner!");
        console.log(neighbour);
        process.exit(0);
      }
      else {
        queue.enq(neighbour);
      }
    });
    console.log("------------------------------")
  }




};

const test1 = new Board("1 8 2 0 4 3 7 6 5", 3, 0, 0);
const answer = new Board("1 2 3 4 5 6 7 8 0", 3, 0, 0);

compute(test1, answer);
// const answer = new Board("1 2 3 4 5 6 7 8 0", 3);
// const test2 = new Board("8 1 3 4 0 6 7 2 5", 3);

// console.log(test2.neighbours());
// console.log(test2.tostring());
// console.log(test0.equals(test1));












