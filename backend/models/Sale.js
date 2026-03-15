const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  // customer information for printed invoice
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"]
      },
      price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"]
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, "Total amount cannot be negative"]
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi"],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  voided: {
    type: Boolean,
    default: false
  },
  voidedAt: {
    type: Date
  },
  voidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Sale", saleSchema);
