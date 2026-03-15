// Test script to create products with specific expiry dates
const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://127.0.0.1:27017/supermarket")
    .then(async () => {
        console.log("Connected to MongoDB.");

        // Expired Product (Yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const expiredProduct = await Product.create({
            name: "Expired Milk",
            brand: "TestBrand",
            category: "Dairy",
            price: 50,
            stock: 10,
            reorderLevel: 2,
            expiryDate: yesterday
        });
        console.log("Created Expired Product:", expiredProduct.name);

        // Expiring Soon Product (Tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const soonProduct = await Product.create({
            name: "Expiring Bread",
            brand: "TestBrand",
            category: "Bakery",
            price: 30,
            stock: 15,
            reorderLevel: 5,
            expiryDate: tomorrow
        });
        console.log("Created Expiring Soon Product:", soonProduct.name);

        // Healthy Product (Next Month)
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const healthyProduct = await Product.create({
            name: "Healthy Cereal",
            brand: "TestBrand",
            category: "Breakfast",
            price: 150,
            stock: 40,
            reorderLevel: 10,
            expiryDate: nextMonth
        });
        console.log("Created Healthy Product:", healthyProduct.name);

        console.log("Test data creation complete.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
