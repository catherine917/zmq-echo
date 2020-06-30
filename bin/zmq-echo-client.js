#!/usr/bin/env node

var zmq = require("zmq");
var randorandomize = require('randomatic');
let operations = 0;
let value = randorandomize('*',1024);
let start =  Date.now();
let i = 0;

function run() {
    var s = zmq.createSocket("req");
    s.connect(process.argv[2]);
    s.on("message", function (data) {
        ++operations;
        // process.stdout.write(data.toString(), "utf-8");
    });
    s.send(value);
}
while( i < 1000 ) {
    run();
    i++;
}
let end = Date.now();
let seconds = (end - start) / 1000;
console.log(seconds);
console.log(`operations: ${operations}`)
let ops = operations/seconds
console.log(ops);






