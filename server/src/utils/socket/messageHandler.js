export const messageHandler = (io, socket) => {
    // Handle sending messages
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
        io.to(receiverId).emit("receivedMessage", {
            from: senderId,  // match your frontend
            ...message       // send text, attachments, _id etc.
        });
    });
};
