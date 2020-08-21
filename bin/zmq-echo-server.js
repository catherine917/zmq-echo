#!/usr/bin/env node

var zmq = require("zmq");

var s = zmq.createSocket("req");
// s.bind("tcp://*:7777");
s.connect('tcp://a86ba068229a34dc49abdc8ed5a99ddd-147272147.ap-southeast-1.elb.amazonaws.com:5000')
s.send("tst");
// s.on("message", function(data) {
//     s.send(data);
// });
