#!/usr/bin/env node

var zmq = require("zmq");

var s = zmq.createSocket("rep");
s.bind("tcp://*:7777");
s.on("message", function(data) {
    s.send(data);
});
