const zmq = require("zmq");

let message_size = Number(process.argv[2]);
let message_count = Number(process.argv[3]);
let client_id = Number(process.argv[4]);
console.log(`client_id is ${client_id}`);
let thread_number = Number(process.argv[5]);
let message = Buffer.alloc(message_size, "h");

// const server_ip = ["13.250.19.134","54.179.216.119", "18.141.240.42", "54.255.230.177"];
const server_ip = ["54.169.100.214"];
const server_port = 5555;
let client_port = 6000;

let push_sockets = [];
for(let i = 0 ; i < thread_number; i++) {
    let push = zmq.createSocket("push");
    push.connect(`tcp://54.169.100.214:${server_port + i}`);
    push_sockets.push(push);
}
let pull = zmq.createSocket("pull");
let operation = 0;
let discount = 0;
// pull.on('message', function(fd, ep) {
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
// });
console.log('Start monitoring...');
pull.monitor(500, 0);
pull.bindSync(`tcp://*:${client_port + client_id}`);

pull.on("message", (msg) => {
    ++operation;
    if(msg == "finished") {
        let endtime = process.hrtime(timer);
        let sec = endtime[0] + endtime[1] / 1000000000;
        let throughput = operation / sec;
        console.log("message size: %d [B]", message_size);
        console.log("message count: %d", operation);
        console.log("mean throughput: %d [ops/s]", throughput);
        console.log("overall time: %d secs", sec);
    }
});
let timer = process.hrtime();
for(let i = 0; i < message_count; i++) {
    let index = i % thread_number;
    push_sockets[index].send(`${message}:${client_id}`);
}
console.log("Finish sending all the messages");