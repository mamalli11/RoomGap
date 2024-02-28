let activeUsers = [];

module.exports = class NamespaceSocketHandler {
    #io;
    constructor(io) {
        this.#io = io
    }
    initConnection() {
        this.#io.on("connection", (socket) => {
            const socketExist = activeUsers.find(
                (socketExist) => socketExist.socketId === socket.id
            );

            if (!socketExist) {
                activeUsers.push({ socketId: socket.id, username: 'null', status: 'online' });

                socket.emit("update-user-list", {
                    users: activeUsers.filter(
                        (socketExist) => socketExist.socketId !== socket.id
                    )
                });

                // socket.broadcast.emit("update-user-list", { users: [{ socketId: socket.id, username: 'null' }] });
            }

            socket.on("SetUsername", (data) => {
                activeUsers.find((sid) => {
                    sid.socketId == socket.id ? sid.username = data : null
                })
                socket.broadcast.emit("update-user-list", { users: [{ socketId: socket.id, username: data, status: 'online' }] });
            });
            console.log(socket.handshake.address);
            console.log(socket.request.connection.remoteAddress);
            socket.on("call-user", (data) => {
                
                console.log('******************* offer', data.offer);
                socket.to(data.to).emit("call-made", {
                    username: activeUsers.find((sid) => sid.socketId === socket.id),
                    offer: data.offer,
                    socket: socket.id,
                });
            });

            socket.on("make-answer", (data) => {
                socket.to(data.to).emit("answer-made", {
                    socket: socket.id,
                    answer: data.answer,
                    username: activeUsers.find((uname) => uname.socketId === socket.id)
                });
            });

            socket.on("reject-call", (data) => {
                socket.to(data.from).emit("call-rejected", {
                    socket: socket.id,
                });
            });

            socket.on("disconnect", () => {
                activeUsers = activeUsers.filter(
                    (socketExist) => socketExist.socketId !== socket.id
                );

                socket.broadcast.emit("remove-user", {
                    socketId: socket.id,
                });
            });
        });

    }
}