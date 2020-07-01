var zmq = require("zmq");
var os = require("os");

var message_size = Number(process.argv[2]);
var message_count = Number(process.argv[3]);
var message = new Buffer(message_size);
message.fill("h");

let push = zmq.createSocket("push");
push.bindSync("tcp://*:5555");
let operation = 0;
const pull_ip = ["172.31.44.3", "172.31.44.50","172.31.34.25", "172.31.46.108"];
let sockets = [];
for (let i = 0; i < pull_ip.length; i++) {
  let echo = zmq.createSocket("pull");
//   console.log(`tcp://${pull_ip[i]}:5556`);
  echo.connect(`tcp://${pull_ip[i]}:5556`);
  sockets.push(echo);
}
for (let socket of sockets) {
    socket.on("message", () => {
        ++operation;
        if (operation == message_count) {
            let endtime = process.hrtime(timer);
            let sec = endtime[0] + endtime[1] / 1000000000;
            let throughput = message_count / sec;
            console.log("message size: %d [B]", message_size);
            console.log("message count: %d", message_count);
            console.log("mean throughput: %d [ops/s]", throughput);
            console.log("overall time: %d secs", sec);
            push.close();
            socket.close();
    }
  });
}
let timer = process.hrtime();
for (var i = 0; i < message_count; i++) {
    push.send(message);
}
