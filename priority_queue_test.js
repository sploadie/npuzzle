"use strict";

const _             = require('underscore');
const PriorityQueue = require('priorityqueuejs');

function newString () {
  return Math.random().toString(36).substring(8);
}

let count = 0;
let enqueueCompares = {};
let dequeueingCompares = {};
let dequeueing = false;

const queue = new PriorityQueue(function(a, b) {
  if (dequeueing) {
    if (dequeueingCompares[count] === undefined) {
      dequeueingCompares[count] = 0;
    }
    dequeueingCompares[count]++;
  } else {
    if (enqueueCompares[count] === undefined) {
      enqueueCompares[count] = 0;
    }
    enqueueCompares[count]++;
  }


  return b - a;
});

while (count < 1000) {
  queue.enq(newString());
  count++;

  // if (count % 1000 === 0) {
  //   console.log(`date: ${new Date()}"\t"count: ${count}`);
  // }
}
console.log("enqueueCompares:", enqueueCompares);

dequeueing = true;
while (queue.size()) {
  queue.deq();
  count--;
}
console.log("dequeueingCompares:", dequeueingCompares);

console.log("done");
