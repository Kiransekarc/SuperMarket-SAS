import pandas as pd
import os
import sys

# ==============================================================================
# 1. The Processing Function (Remains the same rigorous validator)
# ==============================================================================
def process_sales_data(file_path):
    """
    Reads, validates, and cleans sales data from an Excel file based on specified requirements,
    including the 'Category' column.

    Args:
        file_path (str): The path to the .xlsx file.

    Returns:
        pandas.DataFrame: The cleaned DataFrame ready for analysis/database insertion.
    
    Raises:
        ValueError: If file format, column names, or data types are invalid.
        FileNotFoundError: If the file does not exist.
    """
    # --- 1. File Check ---
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The file '{file_path}' was not found.")
    
    if not file_path.lower().endswith('.xlsx'):
        raise ValueError("Invalid file format. Only .xlsx (Excel 2007 and later) files are accepted.")

    print(f"Starting process for file: {os.path.basename(file_path)}...")

    try:
        # Read the Excel file using openpyxl engine
        df = pd.read_excel(file_path, engine='openpyxl')
    except Exception as e:
        raise ValueError(f"Failed to read the Excel file. It may be corrupted or in an unsupported format. Error: {e}")

    # --- 2. Column Validation ---
    required_columns = ['Product Name', 'Brand', 'Category', 'Price', 'Quantity Sold', 'Stock', 'Date']
    
    # Check if all required columns exist
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Column names do not match requirements. Missing columns: {', '.join(missing_columns)}")
    
    # Select only the required columns to ignore any extraneous data
    df = df[required_columns]
    print("Column names validated successfully.")

    initial_row_count = len(df)
    print(f"Initial data contains {initial_row_count} rows.")

    # --- 3. Remove Blank Rows ---
    df.dropna(how='all', inplace=True)
    rows_after_dropna = len(df)
    dropped_blank_rows = initial_row_count - rows_after_dropna
    if dropped_blank_rows > 0:
        print(f"-> Removed {dropped_blank_rows} completely blank row(s).")

    # --- 4. Date Validation and Formatting (YYYY-MM-DD) ---
    # coerce errors will turn invalid dates into NaT (Not a Time)
    df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d', errors='coerce')
    invalid_date_mask = df['Date'].isnull()
    invalid_dates_count = invalid_date_mask.sum()

    if invalid_dates_count > 0:
        print(f"-> Warning: Found {invalid_dates_count} row(s) with invalid date formats. Removing rows.")
        df.dropna(subset=['Date'], inplace=True)

    # --- 5. Numeric Validation (Price, Stock, Quantity Sold) ---
    # We use 'coerce' to turn string text into NaN, then drop NaNs.

    # 5a. Validate 'Price' (Must be numeric float and positive)
    df['Price'] = pd.to_numeric(df['Price'], errors='coerce')
    df = df[df['Price'] > 0] # Ensure prices are greater than zero

    # 5b. Validate 'Stock' (Must be integer and non-negative)
    df['Stock'] = pd.to_numeric(df['Stock'], errors='coerce')
    df.dropna(subset=['Stock'], inplace=True)
    df['Stock'] = df['Stock'].astype(int)
    df = df[df['Stock'] >= 0] # Stock can be 0, but not negative

    # 5c. Validate 'Quantity Sold' (Must be integer and positive)
    df['Quantity Sold'] = pd.to_numeric(df['Quantity Sold'], errors='coerce')
    df.dropna(subset=['Quantity Sold'], inplace=True) 
    df['Quantity Sold'] = df['Quantity Sold'].astype(int)
    df = df[df['Quantity Sold'] > 0] # Sold quantity should be at least 1

    # --- Final Summary ---
    # Final safety check to remove any rows that became NaN during coercion
    df.dropna(inplace=True)

    final_row_count = len(df)
    total_dropped = initial_row_count - final_row_count
    print(f"Data processing complete. {total_dropped} invalid row(s) were dropped in total.")
    print(f"Final valid dataset contains {final_row_count} rows.")

    return df

# ==============================================================================
# 2. Main Execution Block (Demonstration with FRESH UNIQUE DATA)
# ==============================================================================
if __name__ == "__main__":
    # Updated filename for freshness
    file_name = "supermarket_sales_v7_fresh_data.xlsx"
    
    # --- Step A: Create a dummy Excel file with NEW UNIQUE DATA ---
    if not os.path.exists(file_name):
        print(f"Creating sample file '{file_name}' with fresh unique data...")
        # Creating distinct data not used in previous examples (e.g., baby, international, deli)
        data = {
            'Product Name': [
                'Sriracha Hot Chili Sauce 28oz', 'Baby Wipes Unscented 3pk', 'Honeycrisp Apples (Organic)',
                'Sliced Turkey Breast 1lb', 'Oat Milk Barista Edition 1L', 'Energy Drink Original 16oz',
                'Whole Wheat Pasta 16oz', 'Greek Yogurt Plain 32oz'
            ],
            'Brand': [
                'Huy Fong Foods', 'Pampers', 'Nature\'s Promise', 'Boar\'s Head', 'Oatly',
                'Red Bull', 'Barilla', 'Chobani'
            ],
            # New Category mix
            'Category': [
                'International Foods', 'Baby Care', 'Produce',
                'Deli', 'Dairy & Alternatives', 'Beverages',
                'Pantry', 'Dairy & Eggs'
            ],
            'Price': [
                # Floats > 0
                4.99, 12.99, 3.99, 11.50, 4.50, 2.50, 1.79, 5.49
            ],
            'Quantity Sold': [
                # Integers > 0
                60, 20, 150, 35, 45, 100, 80, 30
            ],
            'Stock': [
                # Integers >= 0
                120, 50, 200, 40, 80, 300, 150, 60
            ],
            'Date': [
                # New Date Range (January 2024) - YYYY-MM-DD format
                '2024-01-10', '2024-01-10', '2024-01-11', '2024-01-11',
                '2024-01-12', '2024-01-12', '2024-01-13', '2024-01-13'
            ]
        }
        dummy_df = pd.DataFrame(data)
        # Ensure columns are written to Excel in the desired order
        desired_order = ['Product Name', 'Brand', 'Category', 'Price', 'Quantity Sold', 'Stock', 'Date']
        dummy_df = dummy_df[desired_order]
        
        dummy_df.to_excel(file_name, index=False)
        print("Fresh sample file created successfully.\n" + "="*50 + "\n")

    # --- Step B: Run the processing function on the new unique file ---
    try:
        cleaned_data = process_sales_data(file_name)

        print("\n" + "="*50)
        # Since all data is clean, it should show 0 rows dropped.
        print("--- First 8 Rows of Processed Fresh Data ---")
        pd.set_option('display.max_columns', None) 
        pd.set_option('display.width', 1000) # Ensure wide output for terminal
        print(cleaned_data.head(8))
        
        print("\n--- DataFrame Info (Checking Data Types) ---")
        print(cleaned_data.info())

    except (ValueError, FileNotFoundError) as e:
        print(f"\nProcessing Error: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")