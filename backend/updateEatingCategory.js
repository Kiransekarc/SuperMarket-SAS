require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

async function updateEatingCategory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all products with "eating" category (case insensitive)
    const eatingProducts = await Product.find({ 
      category: { $regex: /^eating$/i } 
    });

    console.log(`\n📦 Found ${eatingProducts.length} products with "eating" category`);

    if (eatingProducts.length > 0) {
      // Update all products with "eating" category to "Food & Grocery"
      const result = await Product.updateMany(
        { category: { $regex: /^eating$/i } },
        { $set: { category: "Food & Grocery" } }
      );

      console.log(`✅ Updated ${result.modifiedCount} products to "Food & Grocery" category`);

      // Display updated products
      const updatedProducts = await Product.find({ category: "Food & Grocery" });
      console.log("\n📋 Updated products:");
      updatedProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand}) - ${product.category}`);
      });
    } else {
      console.log("ℹ️  No products found with 'eating' category");
    }

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating category:", error.message);
    process.exit(1);
  }
}

updateEatingCategory();
