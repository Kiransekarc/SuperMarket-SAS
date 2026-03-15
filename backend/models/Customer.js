const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Customer phone is required"],
        unique: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    totalItemsPurchased: {
        type: Number,
        default: 0
    },
    totalAmountSpent: {
        type: Number,
        default: 0
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    memberTier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Customer", customerSchema);
