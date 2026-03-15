const mongoose = require("mongoose");
require("dotenv").config();

const Message = require("./models/Message");

const clearAllMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const result = await Message.deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} messages from the database`);

        await mongoose.connection.close();
        console.log("✅ Database connection closed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing messages:", error);
        process.exit(1);
    }
};

clearAllMessages();
