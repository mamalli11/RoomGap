const socketIO = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const client = createClient();

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect({ url: "redis://127.0.0.1:6379" });
const subClient = client.duplicate();

function initialSocket(httpServer) {
    const io = socketIO(httpServer, {
        cors: {
            origin: "*"
        },
        maxHttpBufferSize: 1e8
    })
    // io.adapter(redis({ host: 'localhost', port: 6379 }));
    const adapter = createAdapter(client, subClient);
    io.adapter(adapter)

    client.on("error", (err) => {
        debug(`REDIS ADAPTOR DISCONNECTED ON pubClient %O`, err)
    })
    subClient.on("error", (err) => {
        debug(`REDIS ADAPTOR DISCONNECTED ON subClient %O`, err)
    })

    return io
}

module.exports = { initialSocket }