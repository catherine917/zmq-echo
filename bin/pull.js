var zmq = require("zmq");

const pull_addr = `tcp://172.31.7.119:${process.argv[2]}`;
const message_count = process.argv[3];

let socket = zmq.createSocket("pull");
socket.connect(pull_addr);
let echo = zmq.createSocket("push");
echo.bindSync("tcp://*:5560");
let counter = 0;
socket.on("message", () => {
    ++counter;
    // console.log(counter);
    if(counter == message_count) {
        echo.send(counter);
        socket.close();
        echo.close();
    }else {
        echo.send(counter);
    }
})