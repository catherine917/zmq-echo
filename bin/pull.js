var zmq = require("zmq");

const pull_addr = "tcp://172.31.33.207:5555";

let socket = zmq.createSocket("pull");
socket.connect(pull_addr);
let echo = zmq.createSocket("push");
echo.bindSync("tcp://*:5556");
let counter = 0;
socket.on("message", () => {
    ++counter;
    // console.log(counter);
    echo.send(counter);
})
socket.on("close", () => {
    console.log("push close");
})