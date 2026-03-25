const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, "Product ID / SKU is required"],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0
    },
    costPrice: {
      type: Number,
      default: 0
    },
    sellingPrice: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    reorderLevel: {
      type: Number,
      required: [true, "Reorder level is required"],
      min: [0, "Reorder level cannot be negative"],
      default: 10
    },
    imageUrl: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    discountType: {
      type: String,
      enum: ["none", "percentage", "fixed"],
      default: "none"
    },
    discountValue: {
      type: Number,
      default: 0,
      min: [0, "Discount value cannot be negative"]
    },
    discountStartDate: {
      type: Date
    },
    discountEndDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);
