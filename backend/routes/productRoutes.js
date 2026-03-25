const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");
const Sale = require("../models/Sale");

// Public route — no auth needed, for customer-facing store view
router.get("/public", async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } })
      .select("name brand category price imageUrl discountType discountValue discountStartDate discountEndDate stock")
      .sort({ category: 1, name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
router.get("/", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add new product
router.post("/", verifyToken, async (req, res) => {
  try {
    const { productId, name, brand, category, price, stock, reorderLevel, imageUrl, expiryDate, discountType, discountValue, discountStartDate, discountEndDate } = req.body;
    // Require at least productId, name, and brand
    if (!productId || !name || !brand) {
      return res.status(400).json({ error: "Product ID, name, and brand are required" });
    }

    // Check for existing product strictly by productId
    const existing = await Product.findOne({
      productId: productId.trim()
    });

    if (existing) {
      // If product exists, increment stock instead of creating duplicate
      const addStock = Number(stock) || 0;
      const updatedFields = {};
      if (category) updatedFields.category = category;
      if (price !== undefined) updatedFields.price = Number(price);
      if (reorderLevel !== undefined) updatedFields.reorderLevel = Number(reorderLevel);
      if (imageUrl !== undefined) updatedFields.imageUrl = imageUrl;
      if (expiryDate !== undefined) updatedFields.expiryDate = expiryDate ? new Date(expiryDate) : null;
      if (discountType !== undefined) updatedFields.discountType = discountType;
      if (discountValue !== undefined) updatedFields.discountValue = Number(discountValue);
      if (discountStartDate !== undefined) updatedFields.discountStartDate = discountStartDate ? new Date(discountStartDate) : null;
      if (discountEndDate !== undefined) updatedFields.discountEndDate = discountEndDate ? new Date(discountEndDate) : null;

      const updatedProduct = await Product.findByIdAndUpdate(
        existing._id,
        { $inc: { stock: addStock }, $set: updatedFields },
        { new: true, runValidators: true }
      );

      console.log(`🔄 Existing product found. Increased stock by ${addStock} for:`, updatedProduct.name);
      return res.status(200).json({ message: 'Stock added to existing product', product: updatedProduct });
    }

    // Create new product when none exists
    const newProduct = new Product({
      productId: productId.trim(),
      name: name.trim(),
      brand: brand.trim(),
      category: category || 'Uncategorized',
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      reorderLevel: Number(reorderLevel) || 10,
      imageUrl: imageUrl || '',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      discountType: discountType || "none",
      discountValue: Number(discountValue) || 0,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null
    });

    const savedProduct = await newProduct.save();
    console.log("✅ Product added:", savedProduct.name);

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("❌ Add product error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { productId, name, brand, category, price, stock, reorderLevel, imageUrl, discountType, discountValue, discountStartDate, discountEndDate, expiryDate } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productId: productId ? productId.trim() : undefined,
        name, brand, category, price, stock, reorderLevel, imageUrl,
        discountType: discountType || "none",
        discountValue: Number(discountValue) || 0,
        discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
        discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Product updated:", updatedProduct);
    res.json(updatedProduct);
  } catch (err) {
    console.error("❌ Update product error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete product - WITH CASCADING DELETION
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product first
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`🗑️ Deleting product: ${product.name}`);

    // Delete all sales that contain this product
    const salesWithProduct = await Sale.find({ "items.product": productId });

    if (salesWithProduct.length > 0) {
      console.log(`🗑️ Found ${salesWithProduct.length} sales with this product`);

      // Delete sales where this is the only product
      const salesToDelete = await Sale.deleteMany({
        "items": { $size: 1 },
        "items.product": productId
      });

      console.log(`✅ Deleted ${salesToDelete.deletedCount} sales completely`);

      // For sales with multiple items, remove only this product's item
      await Sale.updateMany(
        { "items.product": productId, "items": { $not: { $size: 1 } } },
        { $pull: { items: { product: productId } } }
      );

      console.log(`✅ Removed product from multi-item sales`);
    }

    // Delete the product
    await Product.findByIdAndDelete(productId);

    console.log(`✅ Product "${product.name}" deleted permanently from MongoDB`);

    res.json({
      message: "Product and associated sales deleted successfully",
      product: product,
      salesAffected: salesWithProduct.length
    });
  } catch (err) {
    console.error("❌ Delete product error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
