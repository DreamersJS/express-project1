const ws = require('ws');
const server = new ws.Server({ port: 8080 });

server.on('connection', (socket) => {
    console.log('New connection');
    
    socket.on('message', (msg) => {
        console.log(msg);
        socket.send(`${msg}`);
    });
});