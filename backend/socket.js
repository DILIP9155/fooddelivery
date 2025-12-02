import User from "./models/userModel.js";

// Manage mapping socketId->userId
const socketUserMap = new Map();

export const socketHandler = async (io) => {
  io.on("connection", (socket) => {
    // Handle 'identity' event from client: store mapping and update DB
    socket.on("identity", async ({ userId }) => {
      try {
        // Save mapping
        socketUserMap.set(socket.id, userId.toString());
        // Attach on socket for convenience
        socket.userId = userId.toString();

        await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true,
          },
          { new: true }
        );
      } catch (error) {
        console.log("socket identity error:", error);
      }
    });

    // Cleanup on disconnect - mark user offline and clear socketId
    socket.on("disconnect", async (reason) => {
      try {
        const userId = socket.userId || socketUserMap.get(socket.id);
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            socketId: null,
          });
        } else {
          // Optionally try to find user by socket id if mapping not present
          const user = await User.findOne({ socketId: socket.id });
          if (user) {
            await User.findByIdAndUpdate(user._id, {
              isOnline: false,
              socketId: null,
            });
          }
        }
      } catch (error) {
        console.log("socket disconnect cleanup error:", error);
      } finally {
        socketUserMap.delete(socket.id);
      }
    });
    socket.on("logout", async ({ userId }) => {
      try {
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            socketId: null,
          });
        }
      } catch (error) {
        console.log("socket logout error:", error);
      }
    });
  });
};
