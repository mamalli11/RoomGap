const socketIO = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const pubClient = createClient({ url: "redis://:Zb5FuFXrbCfEjfTU3KWaMjWz@roomgapredis:6379/0" });
const subClient = pubClient.duplicate();

function initialSocket(httpServer) {
    const io = socketIO(httpServer, {
        cors: {
            origin: "*"
        },
        maxHttpBufferSize: 1e8
    })
    // io.adapter(redis({ host: 'localhost', port: 6379 }));
    io.adapter(createAdapter(pubClient, subClient));
    return io
}

module.exports = { initialSocket }