const Message = require("../models/Message");
const User = require("../models/User");

// Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { receiver_id, message_text } = req.body;
        const sender_id = req.user.id;

        if (!receiver_id || !message_text) {
            return res.status(400).json({ message: "Receiver ID and message_text are required" });
        }

        const newMessage = await Message.create({
            sender_id,
            receiver_id,
            message_text,
        });

        // Populate sender and receiver details before sending response
        await newMessage.populate('sender_id', 'name role');
        await newMessage.populate('receiver_id', 'name role');

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ message: "Server error while sending message" });
    }
};

// Get conversations list (Users the current user has chatted with)
// Admin -> Gets all users, or users they've talked to
// Staff -> Usually communicates with Admin
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        if (currentUserRole === 'admin') {
            // Admin sees list of all staff members
            const staffMembers = await User.find({ role: 'staff' }).select("-password");
            res.json(staffMembers);
        } else {
            // Staff sees admins
            const admins = await User.find({ role: 'admin' }).select("-password");
            res.json(admins);
        }
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ message: "Server error while fetching conversations" });
    }
};

// Get message history between current user and another user
exports.getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender_id: currentUserId, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: currentUserId },
            ]
        })
        .populate('sender_id', 'name role')
        .populate('receiver_id', 'name role')
        .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Server error while fetching messages" });
    }
};

// Mark a message as read
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const currentUserId = req.user.id; // The person reading the message

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Ensure the current user is the receiver of the message
        if (message.receiver_id.toString() !== currentUserId) {
            return res.status(403).json({ message: "Not authorized to mark this message as read" });
        }

        message.status = "read";
        await message.save();

        res.json(message);
    } catch (err) {
        console.error("Error marking message as read:", err);
        res.status(500).json({ message: "Server error while updating message status" });
    }
};
