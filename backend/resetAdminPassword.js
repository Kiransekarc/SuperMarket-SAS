const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        // Usage:
        //   node resetAdminPassword.js <newPassword> [email]
        const newPassword = process.argv[2] || "admin123";
        const email = process.argv[3] || "admin@gmail.com";

        if (!process.argv[2]) {
            console.log(
                'ℹ️  No password argument provided; defaulting to "admin123".'
            );
            console.log('   Example: node resetAdminPassword.js "NewStrongPassword"\n');
        }

        // Find admin user
        const admin = await User.findOne({ email });

        if (!admin) {
            console.log(`❌ User not found for email: ${email}`);
            await mongoose.connection.close();
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        await admin.save();

        console.log("✅ Admin password has been reset successfully!\n");
        console.log("=== LOGIN CREDENTIALS ===");
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log(`Role: ${admin.role}\n`);

        await mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

resetAdminPassword();
