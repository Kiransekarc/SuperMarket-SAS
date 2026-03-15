require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    productId: "MILK-001",
    name: "Fresh Whole Milk",
    brand: "Amul",
    category: "Dairy",
    price: 62,
    costPrice: 50,
    sellingPrice: 62,
    stock: 150,
    reorderLevel: 30,
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    productId: "BREAD-002",
    name: "Whole Wheat Bread",
    brand: "Britannia",
    category: "Bakery",
    price: 45,
    costPrice: 35,
    sellingPrice: 45,
    stock: 80,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "RICE-003",
    name: "Basmati Rice",
    brand: "India Gate",
    category: "Grains",
    price: 180,
    costPrice: 150,
    sellingPrice: 180,
    stock: 200,
    reorderLevel: 40,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
  },
  {
    productId: "OIL-004",
    name: "Sunflower Oil",
    brand: "Fortune",
    category: "Cooking Essentials",
    price: 220,
    costPrice: 190,
    sellingPrice: 220,
    stock: 120,
    reorderLevel: 25,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400"
  },
  {
    productId: "TEA-005",
    name: "Premium Tea Leaves",
    brand: "Tata Tea",
    category: "Beverages",
    price: 350,
    costPrice: 300,
    sellingPrice: 350,
    stock: 90,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400"
  },
  {
    productId: "SUGAR-006",
    name: "White Sugar",
    brand: "Madhur",
    category: "Cooking Essentials",
    price: 45,
    costPrice: 38,
    sellingPrice: 45,
    stock: 250,
    reorderLevel: 50,
    imageUrl: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400"
  },
  {
    productId: "BISCUIT-007",
    name: "Cream Biscuits",
    brand: "Parle",
    category: "Snacks",
    price: 30,
    costPrice: 22,
    sellingPrice: 30,
    stock: 180,
    reorderLevel: 40,
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
    discountType: "percentage",
    discountValue: 10,
    discountStartDate: new Date(),
    discountEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "SOAP-008",
    name: "Bathing Soap",
    brand: "Lux",
    category: "Personal Care",
    price: 35,
    costPrice: 28,
    sellingPrice: 35,
    stock: 200,
    reorderLevel: 50,
    imageUrl: "https://images.unsplash.com/photo-1585128903994-03b9e8e2d8e0?w=400"
  },
  {
    productId: "TOOTHPASTE-009",
    name: "Toothpaste",
    brand: "Colgate",
    category: "Personal Care",
    price: 85,
    costPrice: 70,
    sellingPrice: 85,
    stock: 150,
    reorderLevel: 30,
    imageUrl: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=400"
  },
  {
    productId: "DETERGENT-010",
    name: "Washing Powder",
    brand: "Surf Excel",
    category: "Household",
    price: 280,
    costPrice: 240,
    sellingPrice: 280,
    stock: 100,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400"
  },
  {
    productId: "CHIPS-011",
    name: "Potato Chips",
    brand: "Lays",
    category: "Snacks",
    price: 20,
    costPrice: 15,
    sellingPrice: 20,
    stock: 300,
    reorderLevel: 60,
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "JUICE-012",
    name: "Mango Juice",
    brand: "Real",
    category: "Beverages",
    price: 120,
    costPrice: 95,
    sellingPrice: 120,
    stock: 75,
    reorderLevel: 15,
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "EGGS-013",
    name: "Farm Fresh Eggs",
    brand: "Keggs",
    category: "Dairy",
    price: 90,
    costPrice: 75,
    sellingPrice: 90,
    stock: 120,
    reorderLevel: 25,
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "BUTTER-014",
    name: "Salted Butter",
    brand: "Amul",
    category: "Dairy",
    price: 55,
    costPrice: 45,
    sellingPrice: 55,
    stock: 100,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400",
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "NOODLES-015",
    name: "Instant Noodles",
    brand: "Maggi",
    category: "Snacks",
    price: 14,
    costPrice: 11,
    sellingPrice: 14,
    stock: 400,
    reorderLevel: 80,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "SHAMPOO-016",
    name: "Hair Shampoo",
    brand: "Pantene",
    category: "Personal Care",
    price: 175,
    costPrice: 145,
    sellingPrice: 175,
    stock: 85,
    reorderLevel: 18,
    imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400"
  },
  {
    productId: "COFFEE-017",
    name: "Instant Coffee",
    brand: "Nescafe",
    category: "Beverages",
    price: 425,
    costPrice: 370,
    sellingPrice: 425,
    stock: 60,
    reorderLevel: 12,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"
  },
  {
    productId: "SALT-018",
    name: "Iodized Salt",
    brand: "Tata Salt",
    category: "Cooking Essentials",
    price: 22,
    costPrice: 18,
    sellingPrice: 22,
    stock: 300,
    reorderLevel: 60,
    imageUrl: "https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=400"
  },
  {
    productId: "ATTA-019",
    name: "Wheat Flour",
    brand: "Aashirvaad",
    category: "Grains",
    price: 320,
    costPrice: 280,
    sellingPrice: 320,
    stock: 140,
    reorderLevel: 30,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"
  },
  {
    productId: "CHOCOLATE-020",
    name: "Dairy Milk Chocolate",
    brand: "Cadbury",
    category: "Snacks",
    price: 45,
    costPrice: 35,
    sellingPrice: 45,
    stock: 250,
    reorderLevel: 50,
    imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
    discountType: "fixed",
    discountValue: 5,
    discountStartDate: new Date(),
    discountEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
  }
];

async function addProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products (optional - comment out if you want to keep existing products)
    // await Product.deleteMany({});
    // console.log("🗑️  Cleared existing products");

    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`✅ Successfully added ${result.length} products to the database`);

    // Display added products
    result.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.brand}) - ₹${product.sellingPrice}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding products:", error.message);
    process.exit(1);
  }
}

addProducts();
