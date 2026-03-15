const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { verifyToken } = require("../middleware/auth");

// Lookup customer by phone
router.get("/phone/:phone", verifyToken, customerController.getCustomerByPhone);

// Lookup customer
router.get("/lookup", verifyToken, customerController.lookupCustomer);

// Get top customers ranking
router.get("/top", verifyToken, customerController.getTopCustomers);

module.exports = router;
