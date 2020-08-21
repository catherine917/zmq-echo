const zmq = require("zmq");
const cluster = require("cluster");

let message_size = Number(process.argv[2]);
let message_count = Number(process.argv[3]);
let client_id = Number(process.argv[4]);
let message = new Buffer(message_size);
message.fill("h");

const server_ip = ["13.250.19.134"];
const server_port = 5555;
let client_port = 5560;
// let ops = Number(message_count / threads);
let push = zmq.createSocket("push");
let index = client_id % server_ip.length;
push.connect(`tcp://${server_ip[index]}:${server_port}`);
let pull = zmq.createSocket("pull");
pull.bindSync(`tcp://*:${client_port}`);
let operation = 0;
    // console.log(pull_sockets[index]);
pull.on("message", () => {
    ++operation;
    if(operation == message_count) {
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
for(let i = 0; i < message_count; i++) {
    push.send(message);
}
// let operation = 0;

// if (cluster.isMaster) {
//   for (let i = 0; i < threads; i++) {
//     let worker = cluster.fork();
//     worker.send({tid:i});
//   }
// } else {
//   process.on("message", ({tid}) => {
//     let push = zmq.createSocket("push");
//     let index = tid % server_ip.length;
//     push.connect(`tcp://${server_ip[index]}:${server_port}`);
//     let pull = zmq.createSocket("pull");
//     pull.bindSync(`tcp://*:${client_port + tid}`);
//     let operation = 0;
//     // console.log(pull_sockets[index]);
//     pull.on("message", () => {
//       ++operation;
//       if(operation == ops) {
//         let endtime = process.hrtime(timer);
//         let sec = endtime[0] + endtime[1] / 1000000000;
//         let throughput = ops / sec;
//         console.log("message size: %d [B]", message_size);
//         console.log("message count: %d", message_count);
//         console.log("mean throughput: %d [ops/s]", throughput);
//         console.log("overall time: %d secs", sec);
//         pull.close();
//         push.close();
//       }
//     });
//     let timer = process.hrtime();
//     for(let i = 0; i < ops; i++) {
//       push.send(message);
//     }
//   })
// }
