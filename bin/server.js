var zmq = require("zmq");

let message_size = Number(process.argv[2]);
const message_count = Number(process.argv[3]);
let message = new Buffer(message_size);
message.fill("h");

const client_ip = ["18.141.209.125", "18.139.224.28", "18.141.140.151", "54.151.208.214"];
const server_port = 5555;
const client_port = 5560;

let puller = zmq.createSocket("pull");
puller.bind(`tcp://*:${server_port}`);
let echo = [];
for(let i = 0; i < client_ip.length; i++) {
    let socket = zmq.createSocket("push");
    socket.connect(`tcp://${client_ip[i]}:${client_port}`);
    echo.push(socket);
}
let counter = 0;
puller.on("message", (msg) => {
    ++counter;
    let v = msg.toString().split(":");
    let index = v[1];
    echo[index].send(counter);
    if(counter == message_count) {
        console.log(`Receive all the message, message count is ${message_count}`);
        puller.close();
        for(let i = 0; i < client_ip.length; i++) {
            echo[i].close();
        }
    }
})