const NamespaceSocketHandler = require("./namespace.socket")

module.exports = {
    socketHandler: (io) => {
        new NamespaceSocketHandler(io).initConnection()
    }
}