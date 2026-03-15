const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const xlsx = require("xlsx");

console.log("✅ saleRoutes.js loaded");
console.log("✅ multer available:", !!multer);
console.log("✅ xlsx available:", !!xlsx);

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log("📄 File filter check:", file.originalname, file.mimetype);
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx files are allowed"));
    }
  }
});

console.log("✅ Multer configured");

// Get all sales
router.get("/", verifyToken, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("items.product")
      .sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    console.error("Get sales error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create new sale
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, customerName, customerPhone, customerAddress } = req.body;
    const Customer = require("../models/Customer");

    console.log("📝 Sale request received:", { items, totalAmount, paymentMethod, customerName, customerPhone });

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    let totalItemsPurchased = 0;

    // Check stock availability and update stock
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.product}` });
      }

      // Check Expiry Date
      if (product.expiryDate && new Date(product.expiryDate).getTime() < new Date().getTime()) {
        const dFormat = new Date(product.expiryDate).toLocaleDateString();
        return res.status(400).json({
          error: `Cannot sell expired product. ${product.name} expired on ${dFormat}.`
        });
      }

      console.log(`📦 Checking stock for ${product.name}: Available=${product.stock}, Requested=${item.quantity}`);

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      totalItemsPurchased += item.quantity;

      console.log(`✅ Stock updated for ${product.name}: ${product.stock + item.quantity} -> ${product.stock}`);
    }

    // Process Customer if phone is provided
    let customerDoc = null;
    if (customerPhone) {
      customerDoc = await Customer.findOne({ phone: customerPhone.trim() });
      // Calculate Tier
      const getTier = (points) => {
        if (points >= 10000) return 'Platinum';
        if (points >= 5000) return 'Gold';
        if (points >= 2000) return 'Silver';
        return 'Bronze';
      };

      if (customerDoc) {
        // Increment purchases
        customerDoc.totalItemsPurchased += totalItemsPurchased;
        customerDoc.totalAmountSpent += Number(totalAmount);
        customerDoc.loyaltyPoints += Number(totalAmount);
        customerDoc.memberTier = getTier(customerDoc.loyaltyPoints);
        customerDoc.name = customerName || customerDoc.name;
        if (customerAddress) customerDoc.address = customerAddress;
        await customerDoc.save();
      } else {
        // Create new customer
        const initialPoints = Number(totalAmount);
        customerDoc = await Customer.create({
          name: customerName,
          phone: customerPhone.trim(),
          address: customerAddress || "",
          totalItemsPurchased: totalItemsPurchased,
          totalAmountSpent: Number(totalAmount),
          loyaltyPoints: initialPoints,
          memberTier: getTier(initialPoints)
        });
      }
    }

    // Create sale record
    const newSale = new Sale({
      items,
      totalAmount: Number(totalAmount),
      paymentMethod,
      customerName,
      customerPhone,
      customerAddress,
      customer: customerDoc ? customerDoc._id : undefined,
      date: new Date()
    });

    const savedSale = await newSale.save();
    console.log("✅ Sale completed:", savedSale._id);

    // Populate product details before returning
    const populatedSale = await Sale.findById(savedSale._id).populate("items.product");

    res.status(201).json(populatedSale);
  } catch (err) {
    console.error("❌ Create sale error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get sales by date range
router.get("/date-range", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const sales = await Sale.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate("items.product");

    res.json(sales);
  } catch (err) {
    console.error("❌ Get sales by date error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Void / Cancel a sale (admin only) - restores stock
router.delete("/:id/void", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can void a sale" });
    }

    const sale = await Sale.findById(req.params.id).populate("items.product");
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    if (sale.voided) return res.status(400).json({ error: "Sale is already voided" });

    // Restore stock for each item
    for (const item of sale.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // Mark sale as voided
    sale.voided = true;
    sale.voidedAt = new Date();
    sale.voidedBy = req.user.id;
    await sale.save();

    res.json({ message: "Sale voided successfully. Stock has been restored." });
  } catch (err) {
    console.error("❌ Void sale error:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Demand Predictions — must be BEFORE /:id
router.get("/ai-predictions", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } });
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);

    const recentSales   = await Sale.find({ date: { $gte: thirtyDaysAgo }, voided: { $ne: true } }).populate("items.product");
    const lastWeekSales = await Sale.find({ date: { $gte: sevenDaysAgo  }, voided: { $ne: true } }).populate("items.product");

    const statsMap = {};
    for (const product of products) {
      statsMap[product._id.toString()] = { product, sold30d: 0, sold7d: 0, revenue30d: 0, salesDays: new Set() };
    }

    for (const sale of recentSales) {
      for (const item of sale.items) {
        if (!item.product) continue;
        const pid = item.product._id ? item.product._id.toString() : item.product.toString();
        if (!statsMap[pid]) continue;
        statsMap[pid].sold30d    += item.quantity;
        statsMap[pid].revenue30d += item.quantity * item.price;
        statsMap[pid].salesDays.add(sale.date.toISOString().split("T")[0]);
      }
    }
    for (const sale of lastWeekSales) {
      for (const item of sale.items) {
        if (!item.product) continue;
        const pid = item.product._id ? item.product._id.toString() : item.product.toString();
        if (!statsMap[pid]) continue;
        statsMap[pid].sold7d += item.quantity;
      }
    }

    const predictions = [];
    for (const entry of Object.values(statsMap)) {
      const { product, sold30d, sold7d, revenue30d } = entry;
      const avgDailyVelocity = sold30d / 30;
      const recentVelocity   = sold7d  / 7;

      let trend = "stable", trendPct = 0;
      if (avgDailyVelocity > 0) {
        trendPct = ((recentVelocity - avgDailyVelocity) / avgDailyVelocity) * 100;
        if (trendPct >= 20) trend = "rising";
        else if (trendPct <= -20) trend = "falling";
      }

      const predictedNext7d    = Math.ceil((recentVelocity * 0.6 + avgDailyVelocity * 0.4) * 7);
      const daysOfStock        = recentVelocity > 0 ? Math.floor(product.stock / recentVelocity) : 999;
      const recommendedRestock = Math.max(0, predictedNext7d * 2 - product.stock);

      let urgency = "ok";
      if (product.stock === 0)          urgency = "critical";
      else if (daysOfStock <= 3)        urgency = "critical";
      else if (daysOfStock <= 7 || product.stock <= product.reorderLevel) urgency = "warning";

      let insight = "";
      if (urgency === "critical" && product.stock === 0)  insight = "Out of stock — reorder immediately.";
      else if (urgency === "critical")                    insight = `Only ${daysOfStock} day(s) of stock left.`;
      else if (urgency === "warning" && trend === "rising") insight = `Demand rising ${Math.abs(trendPct).toFixed(0)}% — may run out soon.`;
      else if (urgency === "warning")                     insight = "Stock below reorder level. Restock soon.";
      else if (trend === "rising")                        insight = `Sales up ${Math.abs(trendPct).toFixed(0)}% this week — high demand.`;
      else if (trend === "falling")                       insight = `Sales down ${Math.abs(trendPct).toFixed(0)}% — consider a promotion.`;
      else if (sold30d === 0)                             insight = "No sales in 30 days — consider discounting.";
      else insight = `Steady demand. ${daysOfStock < 999 ? `~${daysOfStock} days of stock left.` : "Sufficient stock."}`;

      predictions.push({
        productId: product._id, productName: product.name, brand: product.brand,
        category: product.category, imageUrl: product.imageUrl || null,
        currentStock: product.stock, reorderLevel: product.reorderLevel,
        sold30d, sold7d, revenue30d: Math.round(revenue30d),
        avgDailyVelocity: parseFloat(avgDailyVelocity.toFixed(2)),
        predictedNext7d, daysOfStock: daysOfStock === 999 ? null : daysOfStock,
        trend, trendPct: parseFloat(trendPct.toFixed(1)),
        urgency, recommendedRestock, insight
      });
    }

    const urgencyOrder = { critical: 0, warning: 1, ok: 2 };
    predictions.sort((a, b) =>
      urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]
        ? urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        : b.predictedNext7d - a.predictedNext7d
    );

    res.json(predictions);
  } catch (err) {
    console.error("❌ AI Predictions error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get sale by ID (bill lookup)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("items.product");
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json(sale);
  } catch (err) {
    console.error("❌ Get sale by id error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Upload Excel file endpoint - WITH MAXIMUM DEBUGGING
router.post("/upload", (req, res, next) => {
  console.log("\n" + "=".repeat(60));
  console.log("📤 UPLOAD REQUEST RECEIVED");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("=".repeat(60));
  next();
}, verifyToken, (req, res, next) => {
  console.log("✅ Token verified, user:", req.user);
  next();
}, upload.single("file"), async (req, res) => {
  try {
    console.log("📤 Inside upload handler");
    console.log("req.file:", req.file ? "EXISTS" : "NULL");
    console.log("req.body:", req.body);

    if (!req.file) {
      console.error("❌ NO FILE IN REQUEST");
      return res.status(400).json({ error: "No file uploaded. Please select an Excel file." });
    }

    console.log("📄 File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length
    });

    // Read Excel file from buffer
    console.log("📊 Reading Excel file...");
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    console.log("✅ Workbook loaded, sheets:", workbook.SheetNames);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${data.length} rows`);
    console.log("First row sample:", JSON.stringify(data[0], null, 2));

    if (data.length === 0) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // Validate required columns (Stock column is optional and ignored)
    const requiredColumns = ["Product Name", "Brand", "Category", "Price", "Quantity Sold", "Date"];
    const firstRow = data[0];
    const actualColumns = Object.keys(firstRow);
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    console.log("Required columns:", requiredColumns);
    console.log("Actual columns:", actualColumns);

    if (missingColumns.length > 0) {
      console.error("❌ Missing columns:", missingColumns);
      return res.status(400).json({
        error: `Missing required columns: ${missingColumns.join(", ")}. Found columns: ${actualColumns.join(", ")}`
      });
    }

    let salesCreated = 0;
    let productsCreated = 0;
    let productsUpdated = 0;
    let duplicateSales = 0;
    let errorCount = 0;
    const errors = [];

    console.log(`📊 Processing ${data.length} rows...`);

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)

      try {
        console.log(`Processing row ${rowNumber}: ${row["Product Name"]}`);

        // Validate row data
        if (!row["Product Name"] || !row["Brand"] || !row["Category"]) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Missing required data (Product Name, Brand, or Category)`);
          continue;
        }

        const excelPrice = Number(row["Price"]);
        const excelQuantity = Number(row["Quantity Sold"]);

        if (isNaN(excelPrice) || excelPrice <= 0) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid price value`);
          continue;
        }

        if (isNaN(excelQuantity) || excelQuantity <= 0) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid quantity value`);
          continue;
        }

        // Parse date
        let saleDate;
        try {
          if (row["Date"]) {
            // Handle Excel date formats
            if (typeof row["Date"] === 'number') {
              // Excel serial date
              const excelEpoch = new Date(1899, 11, 30);
              saleDate = new Date(excelEpoch.getTime() + row["Date"] * 86400000);
            } else {
              saleDate = new Date(row["Date"]);
            }

            if (isNaN(saleDate.getTime())) {
              throw new Error("Invalid date");
            }
          } else {
            saleDate = new Date();
          }
        } catch (dateErr) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid date format`);
          continue;
        }

        // Find or create product
        let product = await Product.findOne({
          name: row["Product Name"],
          brand: row["Brand"]
        });

        if (!product) {
          // Create new product
          product = new Product({
            name: row["Product Name"],
            brand: row["Brand"],
            category: row["Category"],
            price: excelPrice,
            stock: 0, // Start with 0 stock for historical data
            reorderLevel: 10
          });
          await product.save();
          productsCreated++;
          console.log(`  ✅ Created product: ${product.name}`);
        } else {
          // Update product category and price if different
          let updated = false;
          if (product.category !== row["Category"]) {
            product.category = row["Category"];
            updated = true;
          }
          if (product.price !== excelPrice) {
            product.price = excelPrice;
            updated = true;
          }
          if (updated) {
            await product.save();
            productsUpdated++;
            console.log(`  🔄 Updated product: ${product.name}`);
          } else {
            console.log(`  ✓ Product exists: ${product.name}`);
          }
        }

        // Check for duplicate sale (same product, same date, same quantity)
        const existingSale = await Sale.findOne({
          "items.product": product._id,
          date: {
            $gte: new Date(saleDate.setHours(0, 0, 0, 0)),
            $lt: new Date(saleDate.setHours(23, 59, 59, 999))
          }
        });

        if (existingSale) {
          // Check if same quantity exists
          const sameItem = existingSale.items.find(
            item => item.product.toString() === product._id.toString() && item.quantity === excelQuantity
          );

          if (sameItem) {
            duplicateSales++;
            console.log(`  ⚠️  Duplicate sale detected for ${product.name} on ${saleDate.toDateString()}`);
            continue;
          }
        }

        // Create sale record
        const totalAmount = excelPrice * excelQuantity;
        const newSale = new Sale({
          items: [{
            product: product._id,
            quantity: excelQuantity,
            price: excelPrice
          }],
          totalAmount: totalAmount,
          paymentMethod: "cash", // Default for historical data
          date: saleDate
        });

        await newSale.save();
        salesCreated++;
        console.log(`  ✅ Sale created: ${product.name} x ${excelQuantity} = ₹${totalAmount}`);

      } catch (err) {
        console.error(`  ❌ Error processing row ${rowNumber}:`, err.message);
        errorCount++;
        errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 UPLOAD COMPLETE - SUMMARY:");
    console.log(`   Total Rows: ${data.length}`);
    console.log(`   ✅ Sales Created: ${salesCreated}`);
    console.log(`   🆕 Products Created: ${productsCreated}`);
    console.log(`   🔄 Products Updated: ${productsUpdated}`);
    console.log(`   ⚠️  Duplicate Sales: ${duplicateSales}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log("=".repeat(60));

    const response = {
      message: "File processed successfully",
      summary: {
        salesCreated,
        productsCreated,
        productsUpdated,
        duplicateSales,
        errors: errorCount,
        totalRows: data.length
      }
    };

    if (errors.length > 0 && errors.length <= 10) {
      response.errorDetails = errors;
    } else if (errors.length > 10) {
      response.errorDetails = errors.slice(0, 10);
      response.moreErrors = `... and ${errors.length - 10} more errors`;
    }

    res.json(response);
  } catch (err) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ CRITICAL ERROR:", err);
    console.error("Stack:", err.stack);
    console.error("=".repeat(60));
    res.status(500).json({ error: err.message || "Failed to process file" });
  }
});

console.log("✅ Upload route registered at POST /api/sales/upload");

// Analyze Transactions Excel file endpoint - PREVIEW BEFORE UPLOAD
router.post("/analyze-transactions", (req, res, next) => {
  console.log("\n" + "=".repeat(60));
  console.log("📊 TRANSACTION ANALYSIS REQUEST RECEIVED");
  console.log("=".repeat(60));
  next();
}, verifyToken, upload.single("file"), async (req, res) => {
  try {
    console.log("📊 Inside transaction analysis handler");

    if (!req.file) {
      console.error("❌ NO FILE IN REQUEST");
      return res.status(400).json({ error: "No file uploaded. Please select an Excel file." });
    }

    console.log("📄 File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Read Excel file from buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${data.length} rows`);

    if (data.length === 0) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // Validate required columns
    const requiredColumns = ["Product", "Quantity", "Payment Method", "Total Amount", "Phone Number", "Customer Name"];
    const firstRow = data[0];
    const actualColumns = Object.keys(firstRow);
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        error: `Missing required columns: ${missingColumns.join(", ")}. Found columns: ${actualColumns.join(", ")}`
      });
    }

    let validTransactions = 0;
    let errorCount = 0;
    const errors = [];
    const uniqueCustomers = new Set();
    const productBreakdown = {};
    const paymentMethods = { cash: 0, card: 0, upi: 0 };
    let totalAmount = 0;

    // Analyze each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Validate row data
        if (!row["Product"] || !row["Quantity"] || !row["Payment Method"] || !row["Total Amount"]) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Missing required transaction data`);
          continue;
        }

        const quantity = Number(row["Quantity"]);
        const amount = Number(row["Total Amount"]);
        const paymentMethod = String(row["Payment Method"]).toLowerCase().trim();
        const customerPhone = row["Phone Number"] ? String(row["Phone Number"]).trim() : "";
        const productName = String(row["Product"]).trim();

        // Validate payment method
        if (!["cash", "card", "upi"].includes(paymentMethod)) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid payment method. Must be cash, card, or upi`);
          continue;
        }

        if (isNaN(quantity) || quantity <= 0) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid quantity value`);
          continue;
        }

        if (isNaN(amount) || amount <= 0) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid total amount value`);
          continue;
        }

        // Check if product exists
        const product = await Product.findOne({
          name: { $regex: new RegExp(`^${productName}$`, 'i') },
          isActive: true
        });

        if (!product) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Product "${productName}" not found in inventory`);
          continue;
        }

        // Check stock availability
        if (product.stock < quantity) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${quantity}`);
          continue;
        }

        // Valid transaction
        validTransactions++;
        totalAmount += amount;

        // Track unique customers
        if (customerPhone && customerPhone.length >= 10) {
          const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
          uniqueCustomers.add(cleanPhone);
        }

        // Product breakdown
        if (!productBreakdown[productName]) {
          productBreakdown[productName] = {
            product: productName,
            transactions: 0,
            totalQuantity: 0,
            totalAmount: 0
          };
        }
        productBreakdown[productName].transactions++;
        productBreakdown[productName].totalQuantity += quantity;
        productBreakdown[productName].totalAmount += amount;

        // Payment methods
        paymentMethods[paymentMethod]++;

      } catch (err) {
        console.error(`Error analyzing row ${rowNumber}:`, err.message);
        errorCount++;
        errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    }

    const analysis = {
      totalRows: data.length,
      validTransactions,
      errors: errorCount,
      uniqueCustomers: uniqueCustomers.size,
      productBreakdown: Object.values(productBreakdown),
      paymentMethods,
      totalAmount
    };

    console.log("📊 Analysis complete:", analysis);

    const response = {
      message: "File analyzed successfully",
      analysis
    };

    if (errors.length > 0) {
      response.errorDetails = errors;
    }

    res.json(response);
  } catch (err) {
    console.error("❌ ANALYSIS ERROR:", err);
    res.status(500).json({ error: err.message || "Failed to analyze file" });
  }
});

console.log("✅ Analysis route registered at POST /api/sales/analyze-transactions");

// Upload Transactions Excel file endpoint - NEW FORMAT
router.post("/upload-transactions", (req, res, next) => {
  console.log("\n" + "=".repeat(60));
  console.log("📤 TRANSACTION UPLOAD REQUEST RECEIVED");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("=".repeat(60));
  next();
}, verifyToken, (req, res, next) => {
  console.log("✅ Token verified, user:", req.user);
  next();
}, upload.single("file"), async (req, res) => {
  try {
    console.log("📤 Inside transaction upload handler");
    console.log("req.file:", req.file ? "EXISTS" : "NULL");

    if (!req.file) {
      console.error("❌ NO FILE IN REQUEST");
      return res.status(400).json({ error: "No file uploaded. Please select an Excel file." });
    }

    console.log("📄 File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Read Excel file from buffer
    console.log("📊 Reading Excel file...");
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    console.log("✅ Workbook loaded, sheets:", workbook.SheetNames);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${data.length} rows`);
    console.log("First row sample:", JSON.stringify(data[0], null, 2));

    if (data.length === 0) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // Validate required columns
    const requiredColumns = ["Product", "Quantity", "Payment Method", "Total Amount", "Phone Number", "Customer Name"];
    const firstRow = data[0];
    const actualColumns = Object.keys(firstRow);
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    console.log("Required columns:", requiredColumns);
    console.log("Actual columns:", actualColumns);

    if (missingColumns.length > 0) {
      console.error("❌ Missing columns:", missingColumns);
      return res.status(400).json({
        error: `Missing required columns: ${missingColumns.join(", ")}. Found columns: ${actualColumns.join(", ")}`
      });
    }

    const Customer = require("../models/Customer");
    
    let transactionsCreated = 0;
    let customersCreated = 0;
    let customersUpdated = 0;
    let stockUpdated = 0;
    let duplicates = 0;
    let errorCount = 0;
    const errors = [];

    console.log(`📊 Processing ${data.length} transactions...`);

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)

      try {
        console.log(`Processing row ${rowNumber}: ${row["Product"]}`);

        // Validate row data
        if (!row["Product"] || !row["Quantity"] || !row["Payment Method"] || !row["Total Amount"]) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Missing required transaction data`);
          continue;
        }

        const quantity = Number(row["Quantity"]);
        const totalAmount = Number(row["Total Amount"]);
        const paymentMethod = String(row["Payment Method"]).toLowerCase().trim();
        const customerPhone = row["Phone Number"] ? String(row["Phone Number"]).trim() : "";
        const customerName = row["Customer Name"] ? String(row["Customer Name"]).trim() : "";

        // Validate payment method
        if (!["cash", "card", "upi"].includes(paymentMethod)) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid payment method. Must be cash, card, or upi`);
          continue;
        }

        if (isNaN(quantity) || quantity <= 0) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid quantity value`);
          continue;
        }

        if (isNaN(totalAmount) || totalAmount <= 0) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Invalid total amount value`);
          continue;
        }

        // Find product by name (case-insensitive)
        const product = await Product.findOne({
          name: { $regex: new RegExp(`^${row["Product"].trim()}$`, 'i') },
          isActive: true
        });

        if (!product) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Product "${row["Product"]}" not found in inventory`);
          continue;
        }

        // Check if product has enough stock
        if (product.stock < quantity) {
          errorCount++;
          errors.push(`Row ${rowNumber}: Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${quantity}`);
          continue;
        }

        // Calculate price per item
        const pricePerItem = totalAmount / quantity;

        // Process Customer if phone is provided
        let customerDoc = null;
        if (customerPhone && customerPhone.length >= 10) {
          const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10); // Get last 10 digits
          
          customerDoc = await Customer.findOne({ phone: cleanPhone });
          
          const getTier = (points) => {
            if (points >= 10000) return 'Platinum';
            if (points >= 5000) return 'Gold';
            if (points >= 2000) return 'Silver';
            return 'Bronze';
          };

          if (customerDoc) {
            // Update existing customer
            customerDoc.totalItemsPurchased += quantity;
            customerDoc.totalAmountSpent += totalAmount;
            customerDoc.loyaltyPoints += totalAmount;
            customerDoc.memberTier = getTier(customerDoc.loyaltyPoints);
            if (customerName) customerDoc.name = customerName;
            await customerDoc.save();
            customersUpdated++;
            console.log(`  🔄 Updated customer: ${customerDoc.name}`);
          } else if (customerName) {
            // Create new customer
            const initialPoints = totalAmount;
            customerDoc = await Customer.create({
              name: customerName,
              phone: cleanPhone,
              address: "",
              totalItemsPurchased: quantity,
              totalAmountSpent: totalAmount,
              loyaltyPoints: initialPoints,
              memberTier: getTier(initialPoints)
            });
            customersCreated++;
            console.log(`  ✅ Created customer: ${customerDoc.name}`);
          }
        }

        // Reduce product stock
        product.stock -= quantity;
        await product.save();
        stockUpdated++;
        console.log(`  📦 Stock updated for ${product.name}: ${product.stock + quantity} -> ${product.stock}`);

        // Create sale record
        const newSale = new Sale({
          items: [{
            product: product._id,
            quantity: quantity,
            price: pricePerItem
          }],
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          customer: customerDoc ? customerDoc._id : undefined,
          date: new Date()
        });

        await newSale.save();
        transactionsCreated++;
        console.log(`  ✅ Transaction created: ${product.name} x ${quantity} = ₹${totalAmount}`);

      } catch (err) {
        console.error(`  ❌ Error processing row ${rowNumber}:`, err.message);
        errorCount++;
        errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 TRANSACTION UPLOAD COMPLETE - SUMMARY:");
    console.log(`   Total Rows: ${data.length}`);
    console.log(`   ✅ Transactions Created: ${transactionsCreated}`);
    console.log(`   🆕 Customers Created: ${customersCreated}`);
    console.log(`   🔄 Customers Updated: ${customersUpdated}`);
    console.log(`   📦 Stock Updated: ${stockUpdated} products`);
    console.log(`   ⚠️  Duplicates: ${duplicates}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log("=".repeat(60));

    const response = {
      message: "Transaction file processed successfully",
      summary: {
        transactionsCreated,
        customersCreated,
        customersUpdated,
        stockUpdated,
        duplicates,
        errors: errorCount,
        totalRows: data.length
      }
    };

    if (errors.length > 0 && errors.length <= 10) {
      response.errorDetails = errors;
    } else if (errors.length > 10) {
      response.errorDetails = errors.slice(0, 10);
      response.moreErrors = `... and ${errors.length - 10} more errors`;
    }

    res.json(response);
  } catch (err) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ CRITICAL ERROR:", err);
    console.error("Stack:", err.stack);
    console.error("=".repeat(60));
    res.status(500).json({ error: err.message || "Failed to process transaction file" });
  }
});

console.log("✅ Transaction upload route registered at POST /api/sales/upload-transactions");

module.exports = router;
