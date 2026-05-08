import pandas as pd
import json
import os

# Path to Excel files
data_dir = r"C:\Users\EXPRESS\Downloads\coding\MawgoodWep\data-products"

excel_files = [
    "H-I-X.xlsx",
    "H&S.xlsx",
    "Rehab Lafy.xlsx",
    "مصنع E-S-H.xlsx"
]

print("=" * 80)
print("ANALYZING EXCEL FILES FOR PRODUCT DATA")
print("=" * 80)

for file in excel_files:
    file_path = os.path.join(data_dir, file)
    print(f"\n\n{'='*80}")
    print(f"FILE: {file}")
    print(f"{'='*80}")
    
    try:
        # Read Excel file
        xl = pd.ExcelFile(file_path)
        print(f"\nSheets found: {xl.sheet_names}")
        
        for sheet_name in xl.sheet_names:
            print(f"\n--- Sheet: {sheet_name} ---")
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            print(f"Rows: {len(df)}")
            print(f"Columns: {list(df.columns)}")
            
            # Show first 3 rows
            print("\nFirst 3 rows:")
            print(df.head(3).to_string())
            
            # Show data types
            print("\nData types:")
            print(df.dtypes)
            
            # Check for null values
            print("\nNull values per column:")
            print(df.isnull().sum())
            
    except Exception as e:
        print(f"Error reading {file}: {str(e)}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
