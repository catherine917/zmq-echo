var zmq = require("zmq");

let message_size = Number(process.argv[2]);
const message_count = Number(process.argv[3]);
const server_id = Number(process.argv[4]);
let message = new Buffer(message_size);
message.fill("h");

const client_ip = ["13.212.22.54", "13.212.36.81"];
const server_port = 5555;
const client_port = 5560;

let puller = zmq.createSocket("pull");
puller.bind(`tcp://*:${server_port}`);
let index = server_id % client_ip.length;
let echo = zmq.createSocket("push");
echo.connect(`tcp://${client_ip[index]}:${client_port}`);
let counter = 0;
puller.on("message", () => {
    ++counter;
    echo.send(counter);
    if(counter == message_count) {
        console.log(`Receive all the message, message count is ${message_count}`)
        puller.close();
        echo.close();
    }
})