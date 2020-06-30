var zmq = require("zmq");
const cluster = require("cluster");

// if (process.argv.length != 5) {
//   console.log('usage: remote_thr <bind-to> <message-size> <message-count>')
//   process.exit(1)
// }

var message_size = Number(process.argv[2]);
var message_count = Number(process.argv[3]);
var server_count = Number(process.argv[4]);
var thread_number = Number(process.argv[5]);
var message = new Buffer(message_size);
message.fill("h");

// for (let i = 0; i < server_count; i++) {
//   let socket = zmq.createSocket("push");
//   socket.connect(`tcp://172.31.44.183:${5555 + i}`);
// }
// var sock1 = zmq.createSocket("push");
// var sock2 = zmq.createSocket("push");
// //sock.setsockopt(zmq.ZMQ_SNDHWM, message_count);
// sock1.connect("tcp://172.31.44.183");

// function send() {
//   for (var i = 0; i < message_count; i++) {
//     sock.send(message);
//   }

//   // all messages may not be received by local_thr if closed immediately
//   setTimeout(function () {
//     sock.close();
//   }, 1000);
// }

// // because of what seems to be a bug in node-zmq, we would lose messages
// // if we start sending immediately after calling connect(), so to make this
// // benchmark behave well, we wait a bit...

// setTimeout(send, 1000);
let port = [5555, 5556, 5557, 5558, 5559, 5560, 5561, 5562];
if (cluster.isMaster) {
  let operation_num = 0;
  let total_time = 0;
  let worker_num = 0;
  for (let i = 0; i < thread_number; i++) {
    let worker = cluster.fork();
    worker.send(`tcp://172.31.46.194:${port[i % server_count]}`);
  }
  cluster.on("message", (worker, message, handle) => {
    operation_num += message.ops;
    total_time += message.sec;
    ++worker_num;
    // console.log(`operation number: ${operation_num}`);
    // console.log(`total time: ${total_time}`);
    // console.log(`work number: ${worker_num}`);
    if (worker_num == thread_number) {
        let throughput = operation_num * 2 / total_time;
        console.log("message size: %d [B]", message_size);
        console.log("message count: %d", message_count * thread_number);
        console.log("mean throughput: %d [ops/s]", throughput);
        console.log("overall time: %d secs", total_time);
      }
  });
} else {
  process.on("message", (port) => {
    console.log(port);
    let socket = zmq.createSocket("req");
    let operation = 0;
    let timer = process.hrtime();
    socket.connect(port);
    socket.on("message", (data) => {
        console.log(data);
      if (data == "echo") {
        ++operation;
        // console.log(operation);
      }
      if (operation == message_count) {
        let endtime = process.hrtime(timer);
        var sec = endtime[0] + endtime[1] / 1000000000;
        console.log(sec);
        process.send({ ops: operation, sec: sec });
        setTimeout(function () {
          socket.close();
          process.exit();
        }, 1000);
      }else {
        socket.send(message);
      }
    });
    socket.send(message);
    // for (var i = 0; i < message_count; i++) {
    //   socket.send(message);
    // }
  });
}
