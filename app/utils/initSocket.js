const socketIO = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const client = createClient({ url: process.env.REDIS_URL });
// const client = createClient({ url: "redis://127.0.0.1:6379" });

client.on('error', (err) => console.log('Redis Client Error', err));

// client.connect({ url: "redis://127.0.0.1:6379" });
client.connect();

const subClient = client.duplicate();

function initialSocket(httpServer) {
    const io = socketIO(httpServer, {
        cors: {
            origin: "https://roomgap.iran.liara.run"
        },
        maxHttpBufferSize: 1e8
    })
    // io.adapter(redis({ host: 'localhost', port: 6379 }));
    io.adapter(createAdapter(client, subClient));

    client.on("error", (err) => {
        console.log(`REDIS ADAPTOR DISCONNECTED ON pubClient %O`, err)
    })
    subClient.on("error", (err) => {
        console.log(`REDIS ADAPTOR DISCONNECTED ON subClient %O`, err)
    })

    return io
}

module.exports = { initialSocket }