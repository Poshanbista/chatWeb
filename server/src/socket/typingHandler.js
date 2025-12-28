

export const typingHandler = (io, socket) => {
    socket.on("typing", ({ senderId, receiverId }) => {
        io.to(receiverId).emit("typing", senderId)
    })
}