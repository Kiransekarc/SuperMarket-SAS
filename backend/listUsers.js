const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({});
        console.log("\n=== USERS IN DATABASE ===\n");

        if (users.length === 0) {
            console.log("No users found in database!");
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Role: ${user.role}`);
                console.log("");
            });
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

listUsers();
