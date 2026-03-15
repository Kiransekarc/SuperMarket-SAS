const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message_text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["unread", "read"],
        default: "unread"
    }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
