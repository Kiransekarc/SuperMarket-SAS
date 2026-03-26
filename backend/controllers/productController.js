const Product = require("../models/Product");

/**
 * ADD PRODUCT
 * - If ACTIVE product (name + brand) exists → update stock
 * - If ARCHIVED product exists → restore + update stock
 * - Else → create new product
 */
exports.addProduct = async (req, res) => {
  try {
    let {
      name,
      brand,
      category,
      costPrice,
      sellingPrice,
      stock,
      reorderLevel,
      imageUrl,
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate,
      expiryDate
    } = req.body;

    // 🛡️ BASIC VALIDATION
    if (!name || !brand || !category || !costPrice || !sellingPrice || !stock) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // ✂️ CLEAN INPUT
    name = name.trim();
    brand = brand.trim();
    category = category.trim();

    costPrice = Number(costPrice);
    sellingPrice = Number(sellingPrice);
    stock = Number(stock);
    reorderLevel = Number(reorderLevel) || 10;

    // 🔍 CHECK PRODUCT (CASE-INSENSITIVE)
    const existingProduct = await Product.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      brand: { $regex: `^${brand}$`, $options: "i" }
    });

    // ✅ ACTIVE PRODUCT → UPDATE
    if (existingProduct && existingProduct.isActive) {
      existingProduct.stock += stock;
      existingProduct.costPrice = costPrice;
      existingProduct.sellingPrice = sellingPrice;
      existingProduct.reorderLevel = reorderLevel;
      if (imageUrl) existingProduct.imageUrl = imageUrl;

      // Update discount settings if provided
      if (discountType !== undefined) existingProduct.discountType = discountType;
      if (discountValue !== undefined) existingProduct.discountValue = Number(discountValue) || 0;
      if (discountStartDate) existingProduct.discountStartDate = new Date(discountStartDate);
      if (discountEndDate) existingProduct.discountEndDate = new Date(discountEndDate);

      await existingProduct.save();

      return res.status(200).json({
        message: "Product already exists. Stock updated successfully.",
        product: existingProduct
      });
    }

    // ♻️ ARCHIVED PRODUCT → RESTORE
    if (existingProduct && !existingProduct.isActive) {
      existingProduct.isActive = true;
      existingProduct.stock += stock;
      existingProduct.costPrice = costPrice;
      existingProduct.sellingPrice = sellingPrice;
      existingProduct.reorderLevel = reorderLevel;
      if (imageUrl) existingProduct.imageUrl = imageUrl;

      // Update discount settings if provided
      if (discountType !== undefined) existingProduct.discountType = discountType;
      if (discountValue !== undefined) existingProduct.discountValue = Number(discountValue) || 0;
      if (discountStartDate) existingProduct.discountStartDate = new Date(discountStartDate);
      if (discountEndDate) existingProduct.discountEndDate = new Date(discountEndDate);

      await existingProduct.save();

      return res.status(200).json({
        message: "Archived product restored and stock updated.",
        product: existingProduct
      });
    }

    // 🆕 CREATE NEW PRODUCT
    const product = await Product.create({
      name,
      brand,
      category,
      costPrice,
      sellingPrice,
      stock,
      reorderLevel,
      imageUrl,
      isActive: true,
      discountType: discountType || "none",
      discountValue: Number(discountValue) || 0,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    res.status(201).json({
      message: "New product added successfully.",
      product
    });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to add product" });
  }
};

/**
 * GET PRODUCTS
 * - Returns ONLY ACTIVE products
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * ARCHIVE PRODUCT (SOFT DELETE)
 */
exports.archiveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product archived successfully",
      product
    });
  } catch (err) {
    console.error("ARCHIVE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to archive product"
    });
  }
};

/**
 * RESTORE PRODUCT
 */
exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product restored successfully",
      product
    });
  } catch (err) {
    console.error("RESTORE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to restore product"
    });
  }
};