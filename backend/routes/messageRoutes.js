const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
    sendMessage,
    getConversations,
    getMessages,
    markAsRead
} = require("../controllers/messageController");

router.post("/", verifyToken, sendMessage);
router.get("/conversations", verifyToken, getConversations);
router.get("/:otherUserId", verifyToken, getMessages);
router.put("/:messageId/read", verifyToken, markAsRead);

// Clear chat history with a specific user
router.delete("/clear/:otherUserId", verifyToken, async (req, res) => {
    try {
        const Message = require("../models/Message");
        const currentUserId = req.user.id;
        const { otherUserId } = req.params;

        // Delete all messages between these two users
        await Message.deleteMany({
            $or: [
                { sender_id: currentUserId, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: currentUserId }
            ]
        });

        res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
        console.error("Error clearing chat:", error);
        res.status(500).json({ error: "Failed to clear chat history" });
    }
});

// Clear ALL messages in the database (admin only)
router.delete("/clear-all/database", verifyToken, async (req, res) => {
    try {
        const Message = require("../models/Message");
        
        // Only allow admin to clear all messages
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only admins can clear all messages" });
        }

        const result = await Message.deleteMany({});
        res.json({ 
            message: "All messages cleared successfully",
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error("Error clearing all messages:", error);
        res.status(500).json({ error: "Failed to clear all messages" });
    }
});

module.exports = router;
