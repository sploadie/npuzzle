"use strict";

class Board {
	constructor (text) {
		this.puzzle = text;
	}

	print () {
		console.log(this.puzzle);
	}
};

const test = new Board("well hello there");
test.print();
