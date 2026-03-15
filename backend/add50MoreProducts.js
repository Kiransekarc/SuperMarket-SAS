require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    productId: "YOGURT-021",
    name: "Greek Yogurt",
    brand: "Nestle",
    category: "Dairy",
    price: 65,
    costPrice: 52,
    sellingPrice: 65,
    stock: 95,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "CHEESE-022",
    name: "Cheddar Cheese",
    brand: "Amul",
    category: "Dairy",
    price: 180,
    costPrice: 150,
    sellingPrice: 180,
    stock: 60,
    reorderLevel: 15,
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "PANEER-023",
    name: "Fresh Paneer",
    brand: "Mother Dairy",
    category: "Dairy",
    price: 90,
    costPrice: 75,
    sellingPrice: 90,
    stock: 80,
    reorderLevel: 18,
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "PASTA-024",
    name: "Penne Pasta",
    brand: "Maggi",
    category: "Grains",
    price: 85,
    costPrice: 68,
    sellingPrice: 85,
    stock: 120,
    reorderLevel: 25,
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400"
  },
  {
    productId: "KETCHUP-025",
    name: "Tomato Ketchup",
    brand: "Kissan",
    category: "Condiments",
    price: 140,
    costPrice: 115,
    sellingPrice: 140,
    stock: 110,
    reorderLevel: 22,
    imageUrl: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=400"
  },
  {
    productId: "MAYO-026",
    name: "Mayonnaise",
    brand: "Veeba",
    category: "Condiments",
    price: 165,
    costPrice: 135,
    sellingPrice: 165,
    stock: 75,
    reorderLevel: 15,
    imageUrl: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "PICKLE-027",
    name: "Mango Pickle",
    brand: "Priya",
    category: "Condiments",
    price: 95,
    costPrice: 78,
    sellingPrice: 95,
    stock: 140,
    reorderLevel: 28,
    imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400"
  },
  {
    productId: "JAM-028",
    name: "Mixed Fruit Jam",
    brand: "Kissan",
    category: "Condiments",
    price: 125,
    costPrice: 100,
    sellingPrice: 125,
    stock: 90,
    reorderLevel: 18,
    imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400"
  },
  {
    productId: "HONEY-029",
    name: "Pure Honey",
    brand: "Dabur",
    category: "Condiments",
    price: 280,
    costPrice: 240,
    sellingPrice: 280,
    stock: 65,
    reorderLevel: 13,
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784210?w=400"
  },
  {
    productId: "CORNFLAKES-030",
    name: "Corn Flakes",
    brand: "Kelloggs",
    category: "Breakfast",
    price: 220,
    costPrice: 185,
    sellingPrice: 220,
    stock: 100,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400"
  },
  {
    productId: "OATS-031",
    name: "Rolled Oats",
    brand: "Quaker",
    category: "Breakfast",
    price: 195,
    costPrice: 165,
    sellingPrice: 195,
    stock: 85,
    reorderLevel: 17,
    imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400"
  },
  {
    productId: "PEANUTBUTTER-032",
    name: "Peanut Butter",
    brand: "Sundrop",
    category: "Breakfast",
    price: 240,
    costPrice: 200,
    sellingPrice: 240,
    stock: 70,
    reorderLevel: 14,
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400"
  },
  {
    productId: "COOKIES-033",
    name: "Chocolate Cookies",
    brand: "Britannia",
    category: "Snacks",
    price: 40,
    costPrice: 32,
    sellingPrice: 40,
    stock: 200,
    reorderLevel: 40,
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "NAMKEEN-034",
    name: "Mixture Namkeen",
    brand: "Haldirams",
    category: "Snacks",
    price: 55,
    costPrice: 45,
    sellingPrice: 55,
    stock: 180,
    reorderLevel: 36,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "POPCORN-035",
    name: "Butter Popcorn",
    brand: "Act II",
    category: "Snacks",
    price: 75,
    costPrice: 60,
    sellingPrice: 75,
    stock: 130,
    reorderLevel: 26,
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400"
  },
  {
    productId: "NUTS-036",
    name: "Mixed Nuts",
    brand: "Nutraj",
    category: "Snacks",
    price: 320,
    costPrice: 275,
    sellingPrice: 320,
    stock: 55,
    reorderLevel: 11,
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400"
  },
  {
    productId: "WATER-037",
    name: "Mineral Water",
    brand: "Bisleri",
    category: "Beverages",
    price: 20,
    costPrice: 15,
    sellingPrice: 20,
    stock: 500,
    reorderLevel: 100,
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400"
  },
  {
    productId: "COLA-038",
    name: "Cola Soft Drink",
    brand: "Coca Cola",
    category: "Beverages",
    price: 40,
    costPrice: 32,
    sellingPrice: 40,
    stock: 300,
    reorderLevel: 60,
    imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "ENERGYDRINK-039",
    name: "Energy Drink",
    brand: "Red Bull",
    category: "Beverages",
    price: 125,
    costPrice: 100,
    sellingPrice: 125,
    stock: 150,
    reorderLevel: 30,
    imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34f6a1d0?w=400",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "GREENTEA-040",
    name: "Green Tea Bags",
    brand: "Lipton",
    category: "Beverages",
    price: 285,
    costPrice: 240,
    sellingPrice: 285,
    stock: 70,
    reorderLevel: 14,
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"
  },
  {
    productId: "ICECREAM-041",
    name: "Vanilla Ice Cream",
    brand: "Amul",
    category: "Frozen Foods",
    price: 180,
    costPrice: 145,
    sellingPrice: 180,
    stock: 45,
    reorderLevel: 10,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "FROZENPEAS-042",
    name: "Frozen Green Peas",
    brand: "McCain",
    category: "Frozen Foods",
    price: 95,
    costPrice: 78,
    sellingPrice: 95,
    stock: 80,
    reorderLevel: 16,
    imageUrl: "https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=400",
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "PIZZA-043",
    name: "Frozen Pizza",
    brand: "McCain",
    category: "Frozen Foods",
    price: 245,
    costPrice: 200,
    sellingPrice: 245,
    stock: 35,
    reorderLevel: 8,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "CHICKEN-044",
    name: "Chicken Breast",
    brand: "Venky's",
    category: "Meat",
    price: 280,
    costPrice: 240,
    sellingPrice: 280,
    stock: 50,
    reorderLevel: 12,
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "FISH-045",
    name: "Fresh Fish Fillet",
    brand: "Fresho",
    category: "Meat",
    price: 350,
    costPrice: 300,
    sellingPrice: 350,
    stock: 30,
    reorderLevel: 8,
    imageUrl: "https://images.unsplash.com/photo-1534766438357-2b18525e6e1e?w=400",
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "MUTTON-046",
    name: "Mutton Curry Cut",
    brand: "Licious",
    category: "Meat",
    price: 650,
    costPrice: 560,
    sellingPrice: 650,
    stock: 25,
    reorderLevel: 6,
    imageUrl: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "APPLE-047",
    name: "Fresh Apples",
    brand: "Fresho",
    category: "Fruits",
    price: 180,
    costPrice: 150,
    sellingPrice: 180,
    stock: 100,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"
  },
  {
    productId: "BANANA-048",
    name: "Bananas",
    brand: "Fresho",
    category: "Fruits",
    price: 50,
    costPrice: 40,
    sellingPrice: 50,
    stock: 150,
    reorderLevel: 30,
    imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400"
  },
  {
    productId: "ORANGE-049",
    name: "Fresh Oranges",
    brand: "Fresho",
    category: "Fruits",
    price: 120,
    costPrice: 95,
    sellingPrice: 120,
    stock: 90,
    reorderLevel: 18,
    imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400"
  },
  {
    productId: "GRAPES-050",
    name: "Green Grapes",
    brand: "Fresho",
    category: "Fruits",
    price: 85,
    costPrice: 70,
    sellingPrice: 85,
    stock: 70,
    reorderLevel: 14,
    imageUrl: "https://images.unsplash.com/photo-1599819177626-c0d3b3a5e0e1?w=400"
  },
  {
    productId: "MANGO-051",
    name: "Alphonso Mangoes",
    brand: "Fresho",
    category: "Fruits",
    price: 250,
    costPrice: 210,
    sellingPrice: 250,
    stock: 60,
    reorderLevel: 12,
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
    discountType: "percentage",
    discountValue: 15,
    discountStartDate: new Date(),
    discountEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    productId: "TOMATO-052",
    name: "Fresh Tomatoes",
    brand: "Fresho",
    category: "Vegetables",
    price: 40,
    costPrice: 32,
    sellingPrice: 40,
    stock: 120,
    reorderLevel: 24,
    imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400"
  },
  {
    productId: "ONION-053",
    name: "Red Onions",
    brand: "Fresho",
    category: "Vegetables",
    price: 35,
    costPrice: 28,
    sellingPrice: 35,
    stock: 200,
    reorderLevel: 40,
    imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400"
  },
  {
    productId: "POTATO-054",
    name: "Potatoes",
    brand: "Fresho",
    category: "Vegetables",
    price: 30,
    costPrice: 24,
    sellingPrice: 30,
    stock: 250,
    reorderLevel: 50,
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400"
  },
  {
    productId: "CARROT-055",
    name: "Fresh Carrots",
    brand: "Fresho",
    category: "Vegetables",
    price: 45,
    costPrice: 36,
    sellingPrice: 45,
    stock: 110,
    reorderLevel: 22,
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400"
  },
  {
    productId: "SPINACH-056",
    name: "Fresh Spinach",
    brand: "Fresho",
    category: "Vegetables",
    price: 25,
    costPrice: 20,
    sellingPrice: 25,
    stock: 80,
    reorderLevel: 16,
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"
  },
  {
    productId: "FACEWASH-057",
    name: "Face Wash",
    brand: "Garnier",
    category: "Personal Care",
    price: 145,
    costPrice: 120,
    sellingPrice: 145,
    stock: 95,
    reorderLevel: 19,
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"
  },
  {
    productId: "BODYWASH-058",
    name: "Body Wash",
    brand: "Dove",
    category: "Personal Care",
    price: 285,
    costPrice: 240,
    sellingPrice: 285,
    stock: 70,
    reorderLevel: 14,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
  },
  {
    productId: "DEODORANT-059",
    name: "Deodorant Spray",
    brand: "Axe",
    category: "Personal Care",
    price: 225,
    costPrice: 190,
    sellingPrice: 225,
    stock: 110,
    reorderLevel: 22,
    imageUrl: "https://images.unsplash.com/photo-1631540575618-78c2c3976e0e?w=400"
  },
  {
    productId: "RAZOR-060",
    name: "Shaving Razor",
    brand: "Gillette",
    category: "Personal Care",
    price: 180,
    costPrice: 150,
    sellingPrice: 180,
    stock: 85,
    reorderLevel: 17,
    imageUrl: "https://images.unsplash.com/photo-1627832928782-af7e0a8a0d9b?w=400"
  },
  {
    productId: "CREAM-061",
    name: "Moisturizing Cream",
    brand: "Nivea",
    category: "Personal Care",
    price: 195,
    costPrice: 165,
    sellingPrice: 195,
    stock: 75,
    reorderLevel: 15,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
  },
  {
    productId: "TISSUES-062",
    name: "Facial Tissues",
    brand: "Kleenex",
    category: "Household",
    price: 65,
    costPrice: 52,
    sellingPrice: 65,
    stock: 140,
    reorderLevel: 28,
    imageUrl: "https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400"
  },
  {
    productId: "TOILETPAPER-063",
    name: "Toilet Paper Roll",
    brand: "Origami",
    category: "Household",
    price: 180,
    costPrice: 150,
    sellingPrice: 180,
    stock: 120,
    reorderLevel: 24,
    imageUrl: "https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400"
  },
  {
    productId: "DISHWASH-064",
    name: "Dishwash Liquid",
    brand: "Vim",
    category: "Household",
    price: 125,
    costPrice: 100,
    sellingPrice: 125,
    stock: 100,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400"
  },
  {
    productId: "FLOORCLEAN-065",
    name: "Floor Cleaner",
    brand: "Lizol",
    category: "Household",
    price: 195,
    costPrice: 165,
    sellingPrice: 195,
    stock: 90,
    reorderLevel: 18,
    imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400"
  },
  {
    productId: "AIRFRESH-066",
    name: "Air Freshener",
    brand: "Odonil",
    category: "Household",
    price: 85,
    costPrice: 70,
    sellingPrice: 85,
    stock: 130,
    reorderLevel: 26,
    imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400"
  },
  {
    productId: "MOSQUITO-067",
    name: "Mosquito Repellent",
    brand: "Good Knight",
    category: "Household",
    price: 145,
    costPrice: 120,
    sellingPrice: 145,
    stock: 105,
    reorderLevel: 21,
    imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400"
  },
  {
    productId: "BATTERIES-068",
    name: "AA Batteries",
    brand: "Duracell",
    category: "Electronics",
    price: 95,
    costPrice: 78,
    sellingPrice: 95,
    stock: 150,
    reorderLevel: 30,
    imageUrl: "https://images.unsplash.com/photo-1591952851-682b3e3a9e5e?w=400"
  },
  {
    productId: "BULB-069",
    name: "LED Bulb",
    brand: "Philips",
    category: "Electronics",
    price: 185,
    costPrice: 155,
    sellingPrice: 185,
    stock: 80,
    reorderLevel: 16,
    imageUrl: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400"
  },
  {
    productId: "CANDLES-070",
    name: "Wax Candles",
    brand: "Cycle",
    category: "Household",
    price: 45,
    costPrice: 36,
    sellingPrice: 45,
    stock: 160,
    reorderLevel: 32,
    imageUrl: "https://images.unsplash.com/photo-1602874801006-e24b3e7ff7ae?w=400"
  }
];

async function addProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`✅ Successfully added ${result.length} products to the database`);

    // Display added products
    result.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.brand}) - ₹${product.sellingPrice} - ${product.category}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding products:", error.message);
    process.exit(1);
  }
}

addProducts();
