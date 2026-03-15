const XLSX = require('xlsx');
const path = require('path');

// Sample transaction data
const transactions = [
  {
    "Product": "Milk",
    "Quantity": 2,
    "Payment Method": "cash",
    "Total Amount": 100,
    "Phone Number": "9876543210",
    "Customer Name": "Rajesh Kumar"
  },
  {
    "Product": "Biscuit",
    "Quantity": 5,
    "Payment Method": "upi",
    "Total Amount": 250,
    "Phone Number": "9876543211",
    "Customer Name": "Priya Sharma"
  },
  {
    "Product": "Butter Packet",
    "Quantity": 1,
    "Payment Method": "card",
    "Total Amount": 50,
    "Phone Number": "9876543212",
    "Customer Name": "Amit Patel"
  },
  {
    "Product": "Milk",
    "Quantity": 3,
    "Payment Method": "cash",
    "Total Amount": 150,
    "Phone Number": "9876543210",
    "Customer Name": "Rajesh Kumar"
  },
  {
    "Product": "Biscuit",
    "Quantity": 10,
    "Payment Method": "upi",
    "Total Amount": 500,
    "Phone Number": "9876543213",
    "Customer Name": "Sneha Reddy"
  },
  {
    "Product": "Butter Packet",
    "Quantity": 2,
    "Payment Method": "card",
    "Total Amount": 100,
    "Phone Number": "9876543211",
    "Customer Name": "Priya Sharma"
  },
  {
    "Product": "Milk",
    "Quantity": 1,
    "Payment Method": "cash",
    "Total Amount": 50,
    "Phone Number": "9876543214",
    "Customer Name": "Vikram Singh"
  },
  {
    "Product": "Biscuit",
    "Quantity": 3,
    "Payment Method": "upi",
    "Total Amount": 150,
    "Phone Number": "9876543215",
    "Customer Name": "Anjali Mehta"
  },
  {
    "Product": "Butter Packet",
    "Quantity": 4,
    "Payment Method": "card",
    "Total Amount": 200,
    "Phone Number": "9876543212",
    "Customer Name": "Amit Patel"
  },
  {
    "Product": "Milk",
    "Quantity": 2,
    "Payment Method": "cash",
    "Total Amount": 100,
    "Phone Number": "9876543216",
    "Customer Name": "Deepak Verma"
  }
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
const outputPath = path.join(__dirname, 'sample_transactions.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ Sample transaction Excel file created successfully!');
console.log('📁 File location:', outputPath);
console.log('📊 Total transactions:', transactions.length);
console.log('\n📋 Column Headers:');
console.log('   - Product');
console.log('   - Quantity');
console.log('   - Payment Method (cash/card/upi)');
console.log('   - Total Amount');
console.log('   - Phone Number');
console.log('   - Customer Name');
console.log('\n💡 Note: Make sure these products exist in your inventory before uploading!');
