const zmq = require("zmq");

let message_size = Number(process.argv[2]);
let message_count = Number(process.argv[3]);
let client_id = Number(process.argv[4]);
let message = new Buffer(message_size);
message.fill("h");

const server_ip = ["3.0.55.63"];
const server_port = 5555;
let client_port = 5560;

let push_sockets = [];
for(let i = 0 ; i < server_ip.length; i++) {
    let push = zmq.createSocket("push");
    push.connect(`tcp://${server_ip[i]}:${server_port}`);
    push_sockets.push(push);
}
let pull = zmq.createSocket("pull");
let operation = 0;
// let discount = 0;
// pull.on('disconnect', function(fd, ep) {
//     ++discount;
//     if(discount == server_ip.length) {
//         let endtime = process.hrtime(timer);
//         let sec = endtime[0] + endtime[1] / 1000000000;
//         let throughput = operation / sec;
//         console.log("message size: %d [B]", message_size);
//         console.log("message count: %d", operation);
//         console.log("mean throughput: %d [ops/s]", throughput);
//         console.log("overall time: %d secs", sec);
//     }
//     // pull.close();
//     // push.close();
// });
console.log('Start monitoring...');
// pull.monitor(500, 0);
pull.bindSync(`tcp://*:${client_port}`);

pull.on("message", () => {
    ++operation;
    // let index = operation % server_ip.length;
    // push_sockets[index].send(`${message}:${client_id}`);
    if(operation == message_count) {
        let endtime = process.hrtime(timer);
        let sec = endtime[0] + endtime[1] / 1000000000;
        console.log("overall time: %d secs", sec);
        pull.close();
    }
});
let timer = process.hrtime();
// push_sockets[0].send(`${message}:${client_id}`);
for(let i = 0; i < message_count; i++) {
    let index = i % server_ip.length;
    push_sockets[index].send(`${message}:${client_id}`);
}