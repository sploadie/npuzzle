"use strict";

class Board {
	constructor (string, n) {
		this.npuzzle = [];
		this.n       = n
		this.split   = string.split(" ");

		// places n arrays into npuzzle
		for (var something = 0; something < n; something++) {
			this.npuzzle.push([]);
		}
		// puts n values into each array, converts them to integers
		for (var index = 0; index < this.split.length; index++) {
 	 		this.npuzzle[Math.floor(index / n)].push(parseInt(this.split[index]));
		}
	}

	npuzzle () {
		return(this.npuzzle);
	}

	manhattan_distance () {
		var sum = 0;
    var x = 0;  
    var y = 0;      
		for (var index = 0; index < this.n; index++) {
 	 		for (var something = 0; something < this.n; something++) {
        if (this.npuzzle[index][something] == 0) {
          x = Math.abs(index - (this.n - 1));
          y = Math.abs(something - (this.n - 1));
        }
        else {
          x = Math.abs(index - Math.floor(((this.npuzzle[index][something] - 1 )/ this.n)));
          y = Math.abs(something - Math.floor(((this.npuzzle[index][something] - 1 ) % this.n)));
        }
        // console.log("Number: " + this.npuzzle[index][something])
        // console.log("X: " + x);
        // console.log("Y: " + y);
        sum += x + y
			}
		}
    // console.log(sum);
	}

	equals (board2) {
		if (this.tostring(this.n) == board2.tostring(this.n)) {
			return true;
		}
		return false;
	}

	tostring() {
		var string = [];
		// turns array of arrays into an array
		for (var index = 0; index < Math.pow(this.n, 2); index++) {
 	 		string.push(this.npuzzle[Math.floor(index / this.n)][index % this.n]);
		}
		string = string.toString();
		string = string.replace(/,/g, " ");
		return(string);
	}
};

const test0 = new Board("1 2 3 4 5 6 7 8 0", 3);
const test1 = new Board("1 2 3 4 5 6 7 8 0", 3);
const test2 = new Board("8 2 3 4 5 6 7 2 0", 3);

test2.manhattan_distance();
// console.log(test2.tostring());
// console.log(test0.equals(test1));