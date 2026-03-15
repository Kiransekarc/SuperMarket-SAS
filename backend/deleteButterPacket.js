const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const deleteButterPacket = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find and delete the Butter Packet product
    const result = await Product.deleteOne({ name: 'Butter Packet' });

    if (result.deletedCount > 0) {
      console.log('✅ Successfully deleted "Butter Packet" product');
    } else {
      console.log('⚠️  "Butter Packet" product not found in database');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

deleteButterPacket();
