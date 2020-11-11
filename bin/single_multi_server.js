var zmq = require("zmq");
const cluster = require("cluster");

// var message_size = Number(process.argv[2]);
var message_count = Number(process.argv[2]);
// var client_count = Number(process.argv[4]);
var thread_number = Number(process.argv[3]);
// var message = Buffer.alloc(message_size, "h");
const client_ip = ["54.255.197.175", "52.221.226.51", "54.255.196.195"];
const client_port = 6000;
let echo = [];
for(let i = 0; i < client_ip.length; i++) {
    let socket = zmq.createSocket("push");
    socket.connect(`tcp://${client_ip[i]}:${client_port + i}`);
    echo.push(socket);
}
if (cluster.isMaster) {
  let operation_num = 0;
  let worker_num = 0;
  for (let i = 0; i < thread_number; i++) {
    let worker = cluster.fork();
    worker.send(`tcp://*:${5555 + i}`);
  }
//   cluster.on("message", (worker, message, handle) => {
//     operation_num += message.ops;
//     ++worker_num;
//     console.log(`operation number: ${operation_num}`);
//     // console.log(`total time: ${total_time}`);
//     console.log(`work number: ${worker_num}`);
//     if (worker_num == thread_number) {
//         for(let i = 0; i < client_ip.length; i++) {
//             echo[i].disconnect(`tcp://${client_ip[i]}:${client_port}`);
//         }
//     }
//   });
} else {
  process.on("message", (port) => {
    console.log(port);
    let pull = zmq.createSocket("pull");
    let operation = 0;
    pull.bindSync(port);
    let ops_number = Math.round(message_count / thread_number);
    console.log(ops_number);
    let counter = [0,0,0];
    pull.on("message", (msg) => {
        ++operation;
        let v = msg.toString().split(":");
        let index = v[1];
        echo[index].send(operation);
        if(index == 0) {
            counter[0]++;
        }else if (index == 1) {
            counter[1]++;
        }else{
            counter[2]++;
        }
      if(operation == ops_number) {
        console.log(`counter 0 1 2 is ${counter[0]}, ${counter[1]}, ${counter[2]}`);
        echo[index].send("finished");
    }
    });
  });
}
