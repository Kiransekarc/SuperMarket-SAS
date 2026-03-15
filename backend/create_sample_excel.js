const XLSX = require('xlsx');
const path = require('path');

// Sample sales data with realistic supermarket products
const salesData = [
    { 'Product Name': 'Laptop', 'Brand': 'Dell', 'Category': 'Electronics', 'Price': 45000, 'Quantity Sold': 2, 'Date': '2024-01-15' },
    { 'Product Name': 'Mouse', 'Brand': 'Logitech', 'Category': 'Accessories', 'Price': 500, 'Quantity Sold': 5, 'Date': '2024-01-16' },
    { 'Product Name': 'Keyboard', 'Brand': 'Logitech', 'Category': 'Accessories', 'Price': 1200, 'Quantity Sold': 3, 'Date': '2024-01-17' },
    { 'Product Name': 'Monitor', 'Brand': 'Samsung', 'Category': 'Electronics', 'Price': 15000, 'Quantity Sold': 1, 'Date': '2024-01-18' },
    { 'Product Name': 'Headphones', 'Brand': 'Sony', 'Category': 'Electronics', 'Price': 2500, 'Quantity Sold': 4, 'Date': '2024-01-19' },
    { 'Product Name': 'USB Cable', 'Brand': 'Belkin', 'Category': 'Accessories', 'Price': 200, 'Quantity Sold': 10, 'Date': '2024-01-20' },
    { 'Product Name': 'Webcam', 'Brand': 'Logitech', 'Category': 'Electronics', 'Price': 3500, 'Quantity Sold': 2, 'Date': '2024-01-21' },
    { 'Product Name': 'Printer', 'Brand': 'HP', 'Category': 'Electronics', 'Price': 8000, 'Quantity Sold': 1, 'Date': '2024-01-22' },
    { 'Product Name': 'Notebook', 'Brand': 'Classmate', 'Category': 'Stationery', 'Price': 50, 'Quantity Sold': 20, 'Date': '2024-01-23' },
    { 'Product Name': 'Pen Set', 'Brand': 'Parker', 'Category': 'Stationery', 'Price': 300, 'Quantity Sold': 8, 'Date': '2024-01-24' },
    { 'Product Name': 'Laptop', 'Brand': 'HP', 'Category': 'Electronics', 'Price': 42000, 'Quantity Sold': 1, 'Date': '2024-01-25' },
    { 'Product Name': 'Mouse', 'Brand': 'Dell', 'Category': 'Accessories', 'Price': 450, 'Quantity Sold': 6, 'Date': '2024-01-26' },
    { 'Product Name': 'External HDD', 'Brand': 'Seagate', 'Category': 'Storage', 'Price': 5000, 'Quantity Sold': 3, 'Date': '2024-01-27' },
    { 'Product Name': 'SSD', 'Brand': 'Samsung', 'Category': 'Storage', 'Price': 8500, 'Quantity Sold': 2, 'Date': '2024-01-28' },
    { 'Product Name': 'RAM 8GB', 'Brand': 'Corsair', 'Category': 'Components', 'Price': 3200, 'Quantity Sold': 4, 'Date': '2024-01-29' },
    { 'Product Name': 'Power Bank', 'Brand': 'Mi', 'Category': 'Accessories', 'Price': 1500, 'Quantity Sold': 5, 'Date': '2024-01-30' },
    { 'Product Name': 'Phone Case', 'Brand': 'Spigen', 'Category': 'Accessories', 'Price': 800, 'Quantity Sold': 7, 'Date': '2024-02-01' },
    { 'Product Name': 'Screen Guard', 'Brand': 'Gorilla', 'Category': 'Accessories', 'Price': 300, 'Quantity Sold': 12, 'Date': '2024-02-02' },
    { 'Product Name': 'Charger', 'Brand': 'Anker', 'Category': 'Accessories', 'Price': 1200, 'Quantity Sold': 6, 'Date': '2024-02-03' },
    { 'Product Name': 'Tablet', 'Brand': 'Samsung', 'Category': 'Electronics', 'Price': 25000, 'Quantity Sold': 1, 'Date': '2024-02-04' }
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(salesData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

// Save to Downloads folder
const outputPath = path.join(process.env.USERPROFILE, 'Downloads', 'sample_sales_data.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Sample Excel file created successfully!');
console.log('📁 Location:', outputPath);
console.log('📊 Contains 20 sample sales records');
console.log('\nFile includes:');
console.log('  - 20 sales transactions');
console.log('  - Multiple product categories (Electronics, Accessories, Storage, etc.)');
console.log('  - Various brands (Dell, HP, Samsung, Logitech, etc.)');
console.log('  - Dates from January-February 2024');
console.log('\nYou can now upload this file to test the upload functionality!');
