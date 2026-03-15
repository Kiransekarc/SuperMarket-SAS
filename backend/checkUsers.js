const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const checkAndCreateUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check existing users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    });

    // If no users exist, create a default admin user
    if (users.length === 0) {
      console.log("\n⚠️ No users found! Creating default admin user...");
      
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      const adminUser = await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin"
      });

      console.log("\n✅ Default admin user created:");
      console.log(`   Email: admin@gmail.com`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ${adminUser.role}`);
    }

    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkAndCreateUser();
