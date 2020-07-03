var zmq = require("zmq");
const cluster = require("cluster");

var message_size = Number(process.argv[2]);
var message_count = Number(process.argv[3]);
var message = new Buffer(message_size);
message.fill("h");

let operation = 0;
const pull_ip = ["172.31.7.152"];
const push_port = ["5555"];
const pull_port = 5560;
let pull_sockets = [];
let ops = Number(message_count / push_port.length);

// Create sockets for receving messages
// for (let i = 0; i < pull_ip.length; i++) {
//   let pull = zmq.createSocket("pull");
//   pull.connect(`tcp://${pull_ip[i]}:${pull_port}`);
//   pull_sockets.push(pull);
// }
// for (let pull of pull_sockets) {
//   console.log(pull);
//   // pull.on("message", (count) => {
//   //   ++operation;
//   //   console.log(operation);
//   //   if (count == ops) {
//   //     let endtime = process.hrtime(timer);
//   //     let sec = endtime[0] + endtime[1] / 1000000000;
//   //     let throughput = ops / sec;
//   //     console.log("message size: %d [B]", message_size);
//   //     console.log("message count: %d", message_count);
//   //     console.log("mean throughput: %d [ops/s]", throughput);
//   //     console.log("overall time: %d secs", sec);
//   //     pull.close();
//   //     // push.close();
//   //   }
//   // });
// }



if (cluster.isMaster) {
  for (let i = 0; i < push_port.length; i++) {
    let worker = cluster.fork();
    worker.send({port:push_port[i], index:i});
    // cluster.on("message", (worker, message, handle) => {
    //   operation_num += message.ops;
    //   total_time += message.sec;
    //   ++worker_num;
    //   // console.log(`operation number: ${operation_num}`);
    //   // console.log(`total time: ${total_time}`);
    //   // console.log(`work number: ${worker_num}`);
    //   if (worker_num == push_port.length) {
    //       let throughput = operation_num / total_time;
    //       console.log("message size: %d [B]", message_size);
    //       console.log("message count: %d", message_count);
    //       console.log("mean throughput: %d [ops/s]", throughput);
    //       console.log("overall time: %d secs", total_time);
    //     }
    // });
  }
} else {
  process.on("message", ({port, index}) => {
    let push = zmq.createSocket("push");
    push.bindSync(`tcp://*:${port}`);
    let pull = zmq.createSocket("pull");
    pull.connect(`tcp://${pull_ip[index]}:${pull_port}`);
    let operation = 0;
    // console.log(pull_sockets[index]);
    pull.on("message", () => {
      ++operation;
      if(operation == ops) {
        let endtime = process.hrtime(timer);
        let sec = endtime[0] + endtime[1] / 1000000000;
        let throughput = ops / sec;
        console.log("message size: %d [B]", message_size);
        console.log("message count: %d", message_count);
        console.log("mean throughput: %d [ops/s]", throughput);
        console.log("overall time: %d secs", sec);
        pull.close();
        push.close();
      }
    });
    let timer = process.hrtime();
    for(let i = 0; i < ops; i++) {
      push.send(message);
    }
    
  })
}
