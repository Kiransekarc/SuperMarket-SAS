const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const Sale = require("../models/Sale");
const Product = require("../models/Product");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔍 DEBUG: route loaded
console.log("Upload routes loaded");

router.post("/excel", upload.single("file"), async (req, res) => {
  console.log("UPLOAD ROUTE HIT"); // 🔥 VERY IMPORTANT

  try {
    // 🔴 SAFETY CHECK
    if (!req.file) {
      console.log("NO FILE RECEIVED");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("FILE RECEIVED:", req.file.originalname);

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log("ROWS READ FROM EXCEL:", data.length);

    if (!data.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      console.log("PROCESSING ROW:", row);

      const product = await Product.findOne({
        name: row["Product Name"],
        brand: row["Brand"],
        isActive: true
      });

      if (!product) {
        console.log("PRODUCT NOT FOUND:", row["Product Name"], row["Brand"]);
        skippedCount++;
        continue;
      }

      await Sale.create({
  productId: product._id,
  quantity: Number(row["Quantity Sold"]),
  paymentMode: "Excel", // ✅ VALID ENUM
  totalAmount:
    Number(row["Quantity Sold"]) * product.sellingPrice, // ✅ CALCULATED
  createdAt: row["Date"] ? new Date(row["Date"]) : new Date()
});


      importedCount++;
    }

    res.json({
      message: "Excel data imported successfully",
      imported: importedCount,
      skipped: skippedCount
    });
  } catch (err) {
    console.error("❌ EXCEL UPLOAD ERROR:", err);
    res.status(500).json({ message: "Excel processing failed" });
  }
});

module.exports = router;
