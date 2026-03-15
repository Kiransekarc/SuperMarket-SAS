const Customer = require("../models/Customer");

// Get customer by phone number
exports.getCustomerByPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        console.log("🔍 Looking up customer by phone:", phone);

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const customer = await Customer.findOne({ phone: phone.trim() });

        if (!customer) {
            console.log("❌ Customer not found for phone:", phone);
            return res.status(404).json({ message: "Customer not found" });
        }

        console.log("✅ Customer found:", customer.name, customer.phone);
        res.json(customer);
    } catch (error) {
        console.error("❌ Get customer by phone error:", error);
        res.status(500).json({ message: "Server error during customer lookup" });
    }
};

// Lookup customer by phone
exports.lookupCustomer = async (req, res) => {
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const customer = await Customer.findOne({ phone: phone.trim() });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json(customer);
    } catch (error) {
        console.error("Lookup customer error:", error);
        res.status(500).json({ message: "Server error during customer lookup" });
    }
};

// Get top customers by total items purchased
exports.getTopCustomers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Sort descending by total items purchased
        const topCustomers = await Customer.find()
            .sort({ totalItemsPurchased: -1 })
            .limit(limit);

        res.json(topCustomers);
    } catch (error) {
        console.error("Get top customers error:", error);
        res.status(500).json({ message: "Server error fetching top customers" });
    }
};
