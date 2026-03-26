const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const { verifyToken } = require("../middleware/auth");

// Get analytics by product
router.get("/", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build match stage for date filtering
    let matchStage = {};
    if (startDate && endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: end
      };
    }

    const pipeline = [];

    // Add date filter if provided
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add aggregation stages
    pipeline.push(
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } }
    );

    const analytics = await Sale.aggregate(pipeline);

    res.json(analytics);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard metrics - REAL DATA FROM MONGODB
router.get("/dashboard-metrics", verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's sales from MongoDB
    const todaySalesData = await Sale.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Yesterday's sales from MongoDB
    const yesterdaySalesData = await Sale.aggregate([
      {
        $match: {
          date: {
            $gte: yesterday,
            $lt: today
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Low stock count from MongoDB
    const lowStock = await Product.countDocuments({
      $expr: { $lte: ["$stock", "$reorderLevel"] }
    });

    // Total products from MongoDB
    const totalProducts = await Product.countDocuments();

    const todaySales = todaySalesData[0]?.total || 0;
    const ordersProcessed = todaySalesData[0]?.count || 0;
    const yesterdaySales = yesterdaySalesData[0]?.total || 0;
    const yesterdayOrders = yesterdaySalesData[0]?.count || 0;

    // Calculate percentage changes
    const salesChange = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1)
      : 0;
    const ordersChange = yesterdayOrders > 0
      ? ((ordersProcessed - yesterdayOrders) / yesterdayOrders * 100).toFixed(1)
      : 0;

    console.log("✅ Dashboard Metrics:", {
      todaySales,
      ordersProcessed,
      yesterdaySales,
      yesterdayOrders,
      salesChange,
      ordersChange,
      lowStock,
      totalProducts
    });

    res.json({
      todaySales,
      ordersProcessed,
      lowStockItems: lowStock,
      totalProducts,
      salesChange: parseFloat(salesChange),
      ordersChange: parseFloat(ordersChange)
    });
  } catch (err) {
    console.error("❌ Dashboard metrics error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get recent activities - REAL DATA FROM MONGODB
router.get("/recent-activities", verifyToken, async (req, res) => {
  try {
    const recentSales = await Sale.find()
      .sort({ date: -1 })
      .limit(10)
      .populate({
        path: "items.product",
        select: "name brand price" // Populate product details
      });

    const activities = recentSales.map(sale => {
      const itemCount = sale.items.length;
      const productNames = sale.items
        .filter(item => item.product) // Filter out null products
        .slice(0, 2)
        .map(item => item.product?.name || "Unknown")
        .join(", ");

      return {
        _id: sale._id,
        name: productNames || `Sale #${sale._id.toString().slice(-6)}`,
        action: `${itemCount} item(s) - ${sale.paymentMethod.toUpperCase()}`,
        date: sale.date,
        amount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        items: sale.items // Include items for frontend processing
      };
    });

    console.log(`✅ Found ${activities.length} recent activities`);

    res.json(activities);
  } catch (err) {
    console.error("❌ Recent activities error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get weekly sales data for charts
router.get("/weekly-sales", verifyToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7; // Default to 7 days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const weeklySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(weeklySales);
  } catch (err) {
    console.error("❌ Weekly sales error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;