const XLSX = require('xlsx');
const path = require('path');

// More comprehensive sample transaction data
const transactions = [
  // Milk transactions
  { "Product": "Milk", "Quantity": 2, "Payment Method": "cash", "Total Amount": 100, "Phone Number": "9876543210", "Customer Name": "Rajesh Kumar" },
  { "Product": "Milk", "Quantity": 3, "Payment Method": "upi", "Total Amount": 150, "Phone Number": "9876543211", "Customer Name": "Priya Sharma" },
  { "Product": "Milk", "Quantity": 1, "Payment Method": "card", "Total Amount": 50, "Phone Number": "9876543212", "Customer Name": "Amit Patel" },
  { "Product": "Milk", "Quantity": 4, "Payment Method": "cash", "Total Amount": 200, "Phone Number": "9876543213", "Customer Name": "Sneha Reddy" },
  { "Product": "Milk", "Quantity": 2, "Payment Method": "upi", "Total Amount": 100, "Phone Number": "9876543214", "Customer Name": "Vikram Singh" },
  
  // Biscuit transactions
  { "Product": "Biscuit", "Quantity": 5, "Payment Method": "cash", "Total Amount": 250, "Phone Number": "9876543215", "Customer Name": "Anjali Mehta" },
  { "Product": "Biscuit", "Quantity": 10, "Payment Method": "card", "Total Amount": 500, "Phone Number": "9876543210", "Customer Name": "Rajesh Kumar" },
  { "Product": "Biscuit", "Quantity": 3, "Payment Method": "upi", "Total Amount": 150, "Phone Number": "9876543216", "Customer Name": "Deepak Verma" },
  { "Product": "Biscuit", "Quantity": 7, "Payment Method": "cash", "Total Amount": 350, "Phone Number": "9876543217", "Customer Name": "Kavita Joshi" },
  { "Product": "Biscuit", "Quantity": 2, "Payment Method": "card", "Total Amount": 100, "Phone Number": "9876543211", "Customer Name": "Priya Sharma" },
  
  // Butter Packet transactions
  { "Product": "Butter Packet", "Quantity": 1, "Payment Method": "upi", "Total Amount": 50, "Phone Number": "9876543218", "Customer Name": "Rahul Gupta" },
  { "Product": "Butter Packet", "Quantity": 2, "Payment Method": "cash", "Total Amount": 100, "Phone Number": "9876543212", "Customer Name": "Amit Patel" },
  { "Product": "Butter Packet", "Quantity": 3, "Payment Method": "card", "Total Amount": 150, "Phone Number": "9876543219", "Customer Name": "Neha Kapoor" },
  { "Product": "Butter Packet", "Quantity": 1, "Payment Method": "upi", "Total Amount": 50, "Phone Number": "9876543220", "Customer Name": "Sanjay Rao" },
  { "Product": "Butter Packet", "Quantity": 4, "Payment Method": "cash", "Total Amount": 200, "Phone Number": "9876543213", "Customer Name": "Sneha Reddy" },
  
  // Mixed transactions - repeat customers
  { "Product": "Milk", "Quantity": 2, "Payment Method": "card", "Total Amount": 100, "Phone Number": "9876543215", "Customer Name": "Anjali Mehta" },
  { "Product": "Biscuit", "Quantity": 6, "Payment Method": "upi", "Total Amount": 300, "Phone Number": "9876543218", "Customer Name": "Rahul Gupta" },
  { "Product": "Butter Packet", "Quantity": 2, "Payment Method": "cash", "Total Amount": 100, "Phone Number": "9876543216", "Customer Name": "Deepak Verma" },
  { "Product": "Milk", "Quantity": 5, "Payment Method": "card", "Total Amount": 250, "Phone Number": "9876543219", "Customer Name": "Neha Kapoor" },
  { "Product": "Biscuit", "Quantity": 4, "Payment Method": "upi", "Total Amount": 200, "Phone Number": "9876543220", "Customer Name": "Sanjay Rao" },
  
  // Additional variety
  { "Product": "Milk", "Quantity": 1, "Payment Method": "cash", "Total Amount": 50, "Phone Number": "9876543221", "Customer Name": "Pooja Desai" },
  { "Product": "Biscuit", "Quantity": 8, "Payment Method": "card", "Total Amount": 400, "Phone Number": "9876543222", "Customer Name": "Arjun Nair" },
  { "Product": "Butter Packet", "Quantity": 3, "Payment Method": "upi", "Total Amount": 150, "Phone Number": "9876543223", "Customer Name": "Meera Iyer" },
  { "Product": "Milk", "Quantity": 3, "Payment Method": "cash", "Total Amount": 150, "Phone Number": "9876543224", "Customer Name": "Karan Malhotra" },
  { "Product": "Biscuit", "Quantity": 5, "Payment Method": "card", "Total Amount": 250, "Phone Number": "9876543225", "Customer Name": "Divya Pillai" }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert data to worksheet
const worksheet = XLSX.utils.json_to_sheet(transactions);

// Set column widths for better readability
worksheet['!cols'] = [
  { wch: 20 },  // Product
  { wch: 10 },  // Quantity
  { wch: 18 },  // Payment Method
  { wch: 15 },  // Total Amount
  { wch: 15 },  // Phone Number
  { wch: 20 }   // Customer Name
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

// Save to file
const outputPath = path.join(__dirname, 'sample_transactions_detailed.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ Detailed sample transaction Excel file created successfully!');
console.log('📁 File location:', outputPath);
console.log('📊 Total transactions:', transactions.length);
console.log('\n📋 File contains:');
console.log('   - Multiple transactions per customer (repeat customers)');
console.log('   - All 3 payment methods: cash, card, upi');
console.log('   - Various quantities and amounts');
console.log('   - 25 sample transactions total');
console.log('\n💡 Products used: Milk, Biscuit, Butter Packet');
console.log('💡 Make sure these products exist in your inventory!');
