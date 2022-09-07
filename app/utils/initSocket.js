const socketIO = require("socket.io");
const redis = require('socket.io-redis')

function initialSocket(httpServer) {
    const io = socketIO(httpServer, {
        cors: {
            origin: "*"
        },
        maxHttpBufferSize: 1e8
    })
    io.adapter(redis({ host: 'localhost', port: 6379 }));
    
    return io
}

module.exports = { initialSocket }