function compute (initial_array, heuristic) {
  let board_size = parseInt(Math.sqrt(initial_array.length));
  var initial_board = new Board(initial_array, board_size);

  if (initial_board.solved()) {
    console.log("This one was solved before we even began trying - " +
        "we're going to be honest and take no credit for this one.");
    // process.exit(0);
    return;
  }
  if (!initial_board.unsolvable()) {
    console.error("This puzzle cannot be solved. Infinite loop cancelled.");
    // process.exit(1);
    return;
  }

  // set up heuristic
  if (!initial_board[heuristic] ||
      ["manhattan_distance", "hamming_distance"].indexOf(heuristic) === -1) {
    throw new Error("invalid heuristic function name");
  }
  // options: ["manhattan_distance", "hamming_distance"]
  var queue = new PriorityQueue(function(a, b) {
    return (b["manhattan_distance"]() + b.get_moves().length) - (a["manhattan_distance"]() + a.get_moves().length);
  });

  // keep some statistics
  let max_states_opened = 0;
  let max_states_in_memory = 0;
  let seen_hashes = {};

  queue.enq(initial_board);
  let solved = false;
  while (!solved) {
  // while (queue.size() < 10) {
    const size_now = queue.size();
    if (size_now > max_states_in_memory) {
      max_states_in_memory = size_now;
      if (max_states_in_memory % 100000 === 0) {
        console.log(`states opened: ${max_states_opened}"\t"max in memory: ${max_states_in_memory}`);
      }
    }

    var current_board = queue.deq();
    // shuffle nayboorz because otherwise we'll make a disproportionate
    // number of moves in the same direction
    var neighbours = _.shuffle(current_board.neighbours());

    neighbours.forEach((neighbour) => {
      let hash = neighbour.get_hash();
      let moves = neighbour.get_moves();
      if (seen_hashes[hash] >= moves) {
        return;
      }
      seen_hashes[hash] = moves;

      if (neighbour.solved()) {
        console.log("We have a winner!");
        console.log(neighbour);
        console.log("Max States Opened: " + max_states_opened);
        console.log("Max States In Memory: " + max_states_in_memory);

        // process.exit(0);
        solved = true;
        return;
      }

      max_states_opened++;
      if (max_states_opened % 100000 === 0) {
        console.log(`states opened: ${max_states_opened}"\t"max in memory: ${max_states_in_memory}`);
      }

      queue.enq(neighbour);
    });

    // console.log("------------------------------")
  }
}



Template.body.onRendered(function () {
  // https://docs.google.com/spreadsheets/d/1fTSEtTAe5dUjMP4gybIXZzD36ruBZTujOMc4iW-qDKw/edit?usp=sharing

  let start = new Date();

  let boardString = `
2 3 8
4 1 5
7 6 0
`.replace(/\n/g, " ").trim();

  let board = _.map(boardString.split(" "), (val) => {
    return parseInt(val, 10);
  });

  console.log("board:", board);

  compute(board, "manhattan_distance");

  // compute([
  //   [4, 1, 8],
  //   [3, 0, 7],
  //   [6, 5, 2],
  // ], "manhattan_distance");

  let end = new Date();

  console.log("Time taken:", end - start);
});



// function average (array) {
//   return _.reduce(array, (memo, n) => { return memo + n; }, 0) / array.length;
// }
//
// startingTimes = [
//   10288,
//   6955,
//   8779,
//   4824,
//   9422
// ];
// console.log("average(startingTimes):", average(startingTimes));
//
// firstIteration = [
//   4222,
//   3896,
//   5731,
//   5501,
//   3904,
// ];
// console.log("average(firstIteration):", average(firstIteration));
