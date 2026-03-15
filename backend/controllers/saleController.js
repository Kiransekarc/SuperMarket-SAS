const Sale = require("../models/Sale");
const Product = require("../models/Product");

exports.addSale = async (req, res) => {
  try {
    const { productId, quantity, paymentMode } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const totalAmount = product.sellingPrice * quantity;

    const sale = await Sale.create({
      productId,
      quantity,
      totalAmount,
      paymentMode
    });

    product.stock -= quantity;
    await product.save();

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSalesAnalytics = async (req, res) => {
  try {
    const analytics = await Sale.aggregate([
      {
        $group: {
          _id: "$productId",
          totalQuantitySold: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { totalQuantitySold: -1 }
      }
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("productId", "name brand sellingPrice")
      .sort({ createdAt: -1 })
      .limit(10);

    const formatted = sales.map((s) => ({
      id: s._id,
      product: `${s.productId.name} (${s.productId.brand})`,
      quantity: s.quantity,
      amount: s.quantity * s.productId.sellingPrice,
      paymentMode: s.paymentMode,
      date: s.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const sales = await Sale.find(query)
      .populate("productId", "name brand sellingPrice")
      .sort({ createdAt: -1 });

    const formatted = sales.map((s) => ({
      id: s._id,
      product: `${s.productId.name} (${s.productId.brand})`,
      quantity: s.quantity,
      amount: s.quantity * s.productId.sellingPrice,
      paymentMode: s.paymentMode,
      date: s.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDemandPrediction = async (req, res) => {
  try {
    const sales = await Sale.find().populate("productId");

    const productMap = {};

    sales.forEach((sale) => {
      const id = sale.productId._id.toString();

      if (!productMap[id]) {
        productMap[id] = {
          name: sale.productId.name,
          brand: sale.productId.brand,
          totalSold: 0,
          days: new Set()
        };
      }

      productMap[id].totalSold += sale.quantity;
      productMap[id].days.add(
        sale.createdAt.toISOString().split("T")[0]
      );
    });

    const prediction = Object.values(productMap).map((p) => {
      const avgDaily = p.totalSold / p.days.size;
      return {
        name: `${p.name} (${p.brand})`,
        predictedNextWeek: Math.ceil(avgDaily * 7)
      };
    });

    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
