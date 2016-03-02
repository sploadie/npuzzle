"use strict"; // so that we can do fun es6 things

var _             = require('underscore');
var PriorityQueue = require('priorityqueuejs');


class Board {
	constructor (str, board_size) {
		this.board = [];
		this.board_size = board_size;

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
          array_neighbours.push(new_string);
        }
        else {
          new_string = this.tostring();
          new_string = new_string.replace(/0/, "temp");
          new_string = new_string.replace(this.board[index + change_points[z][0]][something], 0);
          new_string = new_string.replace("temp", this.board[index + change_points[z][0]][something]);
          array_neighbours.push(new_string);
        }
      }
    }
    return(array_neighbours);
  }

	equals (otherBoard) {
		if (this.tostring(this.board_size) === otherBoard.tostring(this.board_size)) {
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


var compute = function() {

  const answer = new Board("1 2 3 4 5 6 7 8 0", 3);
  const test1  = new Board("1 2 3 4 5 6 7 0 8", 3); // 2
  const test3  = new Board("1 5 3 4 2 6 7 0 8", 3); // 4
  const test2  = new Board("8 1 3 4 5 6 7 2 0", 3); // 6
  const test5  = new Board("1 5 3 4 2 6 0 8 7", 3); // 6
  const test4  = new Board("3 7 1 4 5 6 2 0 8", 3); // 12

  var queue = new PriorityQueue(function(a, b) {
    return b.manhattan_distance() - a.manhattan_distance();
  });


  console.log(test1.manhattan_distance());
  console.log(test2.manhattan_distance());
  console.log(test3.manhattan_distance());
  console.log(test4.manhattan_distance());
  console.log(test5.manhattan_distance());

  queue.enq(test1);
  queue.enq(test2);
  queue.enq(test3);
  queue.enq(test4);
  queue.enq(test5);

  queue.forEach(function(a) {
    console.log(a);
  });

  console.log("-----------------------");

  // console.log(queue.size());
  // console.log(queue.peek());
  console.log(queue.deq());
  console.log(queue.deq());
  console.log(queue.deq());
  console.log(queue.deq());
  console.log(queue.deq());


  // console.log(queue.size());

};


compute();
// const answer = new Board("1 2 3 4 5 6 7 8 0", 3);
// const test1 = new Board("1 2 3 4 5 6 7 0 8", 3);
// const test2 = new Board("8 1 3 4 0 6 7 2 5", 3);

// console.log(test2.neighbours());
// console.log(test2.tostring());
// console.log(test0.equals(test1));












