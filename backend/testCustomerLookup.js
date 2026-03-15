require("dotenv").config();
const mongoose = require("mongoose");
const Customer = require("./models/Customer");

async function testCustomerLookup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // List all customers
    const customers = await Customer.find();
    console.log(`\n📋 Total customers in database: ${customers.length}\n`);

    if (customers.length > 0) {
      console.log("Customer List:");
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. Name: ${customer.name}`);
        console.log(`   Phone: ${customer.phone}`);
        console.log(`   Address: ${customer.address || 'N/A'}`);
        console.log(`   Total Spent: ₹${customer.totalAmountSpent}`);
        console.log(`   Loyalty Points: ${customer.loyaltyPoints}`);
        console.log(`   Tier: ${customer.memberTier}`);
        console.log('');
      });

      // Test lookup by phone
      const testPhone = customers[0].phone;
      console.log(`\n🔍 Testing lookup for phone: ${testPhone}`);
      const found = await Customer.findOne({ phone: testPhone });
      if (found) {
        console.log("✅ Customer found successfully!");
        console.log(`   Name: ${found.name}`);
      } else {
        console.log("❌ Customer NOT found!");
      }
    } else {
      console.log("No customers found in database.");
      console.log("Complete a sale with customer details to create one.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testCustomerLookup();
