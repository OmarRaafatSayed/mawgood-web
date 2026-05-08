"""
Mawgood Product Uploader - Version 2
Uploads products from Excel files to Medusa backend
"""

import pandas as pd
import requests
import json
import os
from typing import List, Dict, Any, Optional
import time
import getpass

# Configuration
BACKEND_URL = "http://localhost:9000"
PUBLISHABLE_KEY = "pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53"
DATA_DIR = r"C:\Users\EXPRESS\Downloads\coding\MawgoodWep\data-products"

# Excel files to process
EXCEL_FILES = [
    "H-I-X.xlsx",
    "H&S.xlsx",
    "Rehab Lafy.xlsx",
    "مصنع E-S-H.xlsx"
]

class ProductUploader:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.auth_token = None
        self.stats = {
            "total": 0,
            "success": 0,
            "failed": 0,
            "skipped": 0,
            "errors": []
        }
    
    def authenticate(self) -> bool:
        """Authenticate with the backend"""
        print("\n" + "="*80)
        print("AUTHENTICATING")
        print("="*80)
        
        try:
            # Try admin login endpoint
            response = self.session.post(
                f"{BACKEND_URL}/admin/auth/token",
                json={
                    "email": self.email,
                    "password": self.password
                },
                headers={
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("token")
                
                # Update session headers
                self.session.headers.update({
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.auth_token}"
                })
                
                print(f"✓ Authentication successful for {self.email}")
                return True
            else:
                print(f"✗ Authentication failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"✗ Authentication error: {str(e)}")
            return False
    
    def parse_colors(self, color_str: str) -> List[str]:
        """Parse color string and extract individual colors"""
        if pd.isna(color_str) or not color_str:
            return []
        
        # Remove bullets and split by newline
        colors = str(color_str).replace("●", "").strip().split("\n")
        colors = [c.strip() for c in colors if c.strip()]
        
        return colors
    
    def parse_sizes(self, size_str: str) -> List[str]:
        """Parse size string and extract individual sizes"""
        if pd.isna(size_str) or not size_str:
            return []
        
        # Clean and split sizes
        size_str = str(size_str).replace("ك", "").replace(":", " - ")
        sizes = size_str.split("\n")
        sizes = [s.strip() for s in sizes if s.strip()]
        
        return sizes
    
    def clean_text(self, text: Any) -> str:
        """Clean and normalize text"""
        if pd.isna(text) or text is None:
            return ""
        return str(text).strip()
    
    def get_price(self, egp_price: Any, sar_price: Any) -> int:
        """Get price in cents (EGP), fallback to SAR conversion if needed"""
        if not pd.isna(egp_price) and egp_price:
            return int(float(egp_price) * 100)  # Convert to cents
        elif not pd.isna(sar_price) and sar_price:
            # Convert SAR to EGP (approximate rate: 1 SAR = 13 EGP)
            return int(float(sar_price) * 13 * 100)  # Convert to cents
        else:
            return 10000  # Default price: 100 EGP
    
    def create_product_payload(self, row: pd.Series, file_name: str) -> Optional[Dict[str, Any]]:
        """Create product payload from Excel row"""
        
        # Extract data
        code = self.clean_text(row.get('CODE') or row.get('Code'))
        if not code:
            return None
        
        title = self.clean_text(row.get('وصف المنتج', ''))
        category = self.clean_text(row.get('الصنف', ''))
        
        # Parse colors and sizes
        colors = self.parse_colors(row.get('اللون', ''))
        sizes = self.parse_sizes(row.get('المقاس', ''))
        
        # Get price
        egp_price = row.get('السعر بالجنيه') or row.get('السعر بالجنيه ')
        sar_price = row.get('السعر بالريال')
        price_cents = self.get_price(egp_price, sar_price)
        
        # Generate handle from code
        handle = code.lower().replace(" ", "-").replace("/", "-").replace("●", "")
        
        # Create title if empty
        if not title:
            title = f"{category} {code}" if code else f"Product {handle}"
        
        # Create options and variants
        options = []
        variants = []
        
        # Determine options structure
        has_colors = len(colors) > 0
        has_sizes = len(sizes) > 0
        
        if has_colors:
            options.append({
                "title": "اللون",
                "values": colors
            })
        
        if has_sizes:
            options.append({
                "title": "المقاس",
                "values": sizes
            })
        
        # If no options, create a default variant
        if not options:
            options.append({
                "title": "Default",
                "values": ["Default"]
            })
        
        # Generate variants based on options
        variant_rank = 0
        
        if len(options) == 1:
            # Single option
            for value in options[0]["values"]:
                variant = {
                    "title": f"{value}",
                    "sku": f"{code}-{value}".replace(" ", "-").replace("●", ""),
                    "manage_inventory": False,
                    "allow_backorder": True,
                    "options": {options[0]["title"]: value},
                    "variant_rank": variant_rank,
                    "prices": [
                        {
                            "currency_code": "egp",
                            "amount": price_cents
                        }
                    ]
                }
                variants.append(variant)
                variant_rank += 1
        
        elif len(options) == 2:
            # Two options (color and size)
            for color in options[0]["values"]:
                for size in options[1]["values"]:
                    variant = {
                        "title": f"{color} - {size}",
                        "sku": f"{code}-{color}-{size}".replace(" ", "-").replace("●", ""),
                        "manage_inventory": False,
                        "allow_backorder": True,
                        "options": {
                            options[0]["title"]: color,
                            options[1]["title"]: size
                        },
                        "variant_rank": variant_rank,
                        "prices": [
                            {
                                "currency_code": "egp",
                                "amount": price_cents
                            }
                        ]
                    }
                    variants.append(variant)
                    variant_rank += 1
        
        # Create product payload
        payload = {
            "title": title,
            "subtitle": f"كود: {code}",
            "handle": handle,
            "description": f"{title}\n\nالصنف: {category}\nالكود: {code}\nالمصدر: {file_name}",
            "status": "published",
            "discountable": True,
            "options": options,
            "variants": variants,
            "is_giftcard": False
        }
        
        return payload
    
    def delete_all_products(self) -> int:
        """Delete all existing products"""
        print("\n" + "="*80)
        print("DELETING ALL EXISTING PRODUCTS")
        print("="*80)
        
        deleted = 0
        
        try:
            # Get all products with pagination
            offset = 0
            limit = 50
            
            while True:
                response = self.session.get(
                    f"{BACKEND_URL}/admin/products",
                    params={"limit": limit, "offset": offset}
                )
                
                if response.status_code != 200:
                    print(f"Failed to fetch products: {response.status_code}")
                    print(f"Response: {response.text}")
                    break
                
                data = response.json()
                products = data.get("products", [])
                
                if not products:
                    break
                
                print(f"\nDeleting batch of {len(products)} products...")
                
                # Delete each product
                for product in products:
                    product_id = product.get("id")
                    try:
                        del_response = self.session.delete(
                            f"{BACKEND_URL}/admin/products/{product_id}"
                        )
                        if del_response.status_code in [200, 204]:
                            deleted += 1
                            print(f"  ✓ Deleted: {product.get('title', product_id)[:50]}")
                        else:
                            print(f"  ✗ Failed to delete {product_id}: {del_response.status_code}")
                    except Exception as e:
                        print(f"  ✗ Error deleting {product_id}: {str(e)}")
                    
                    time.sleep(0.05)  # Small delay
                
                offset += limit
            
            print(f"\n✓ Successfully deleted {deleted} products")
            return deleted
            
        except Exception as e:
            print(f"✗ Error during deletion: {str(e)}")
            return deleted
    
    def upload_product(self, payload: Dict[str, Any], row_num: int, file_name: str) -> bool:
        """Upload a single product"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/admin/products",
                json=payload
            )
            
            if response.status_code in [200, 201]:
                self.stats["success"] += 1
                product_data = response.json()
                product_id = product_data.get("product", {}).get("id", "unknown")
                print(f"  ✓ Row {row_num}: {payload['title'][:50]} (ID: {product_id})")
                return True
            else:
                self.stats["failed"] += 1
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                self.stats["errors"].append({
                    "file": file_name,
                    "row": row_num,
                    "title": payload['title'],
                    "error": error_msg
                })
                print(f"  ✗ Row {row_num}: {error_msg}")
                return False
                
        except Exception as e:
            self.stats["failed"] += 1
            error_msg = str(e)
            self.stats["errors"].append({
                "file": file_name,
                "row": row_num,
                "title": payload.get('title', 'Unknown'),
                "error": error_msg
            })
            print(f"  ✗ Row {row_num}: {error_msg}")
            return False
    
    def process_excel_file(self, file_name: str):
        """Process a single Excel file"""
        file_path = os.path.join(DATA_DIR, file_name)
        
        print(f"\n{'='*80}")
        print(f"PROCESSING: {file_name}")
        print(f"{'='*80}")
        
        try:
            # Read Excel file
            xl = pd.ExcelFile(file_path)
            sheet_name = xl.sheet_names[0]
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            print(f"Found {len(df)} rows in sheet '{sheet_name}'")
            print()
            
            # Process each row
            for idx, row in df.iterrows():
                # Skip empty rows
                code = row.get('CODE') or row.get('Code')
                if pd.isna(code) or not str(code).strip():
                    self.stats["skipped"] += 1
                    continue
                
                self.stats["total"] += 1
                
                # Create payload
                payload = self.create_product_payload(row, file_name)
                
                if not payload:
                    self.stats["skipped"] += 1
                    continue
                
                # Upload product
                self.upload_product(payload, idx + 2, file_name)  # +2 for Excel row number
                
                # Small delay to avoid overwhelming the API
                time.sleep(0.1)
            
        except Exception as e:
            print(f"✗ Error processing file {file_name}: {str(e)}")
    
    def run(self):
        """Main execution"""
        print("\n" + "="*80)
        print("MAWGOOD PRODUCT UPLOADER v2")
        print("="*80)
        
        # Step 0: Authenticate
        if not self.authenticate():
            print("\n✗ Failed to authenticate. Exiting.")
            return
        
        # Step 1: Delete all existing products
        self.delete_all_products()
        
        # Step 2: Upload new products from Excel files
        print("\n" + "="*80)
        print("UPLOADING NEW PRODUCTS")
        print("="*80)
        
        for file_name in EXCEL_FILES:
            self.process_excel_file(file_name)
        
        # Print summary
        print("\n" + "="*80)
        print("UPLOAD SUMMARY")
        print("="*80)
        print(f"Total products processed: {self.stats['total']}")
        print(f"Successfully uploaded: {self.stats['success']}")
        print(f"Failed: {self.stats['failed']}")
        print(f"Skipped (empty rows): {self.stats['skipped']}")
        
        if self.stats["errors"]:
            print(f"\n{'='*80}")
            print(f"ERRORS ({len(self.stats['errors'])} total, showing first 10):")
            print(f"{'='*80}")
            for error in self.stats["errors"][:10]:
                print(f"\nFile: {error['file']}")
                print(f"Row: {error['row']}")
                print(f"Title: {error['title'][:50]}")
                print(f"Error: {error['error'][:200]}")
        
        print("\n" + "="*80)
        print("UPLOAD COMPLETE")
        print("="*80)

def main():
    """Main entry point"""
    print("\n" + "="*80)
    print("MAWGOOD PRODUCT UPLOADER")
    print("="*80)
    print("\nThis script will:")
    print("1. Delete ALL existing products from the database")
    print("2. Upload new products from Excel files")
    print("\nMake sure the backend is running at:", BACKEND_URL)
    
    # Get credentials
    print("\n" + "="*80)
    print("ADMIN CREDENTIALS")
    print("="*80)
    email = input("Enter admin email: ").strip()
    password = getpass.getpass("Enter admin password: ")
    
    if not email or not password:
        print("\n✗ Email and password are required!")
        return
    
    # Confirm action
    print("\n" + "="*80)
    print("⚠️  WARNING ⚠️")
    print("="*80)
    print("This will DELETE ALL existing products!")
    confirm = input("Type 'YES' to continue: ").strip()
    
    if confirm != "YES":
        print("\n✗ Operation cancelled.")
        return
    
    # Run uploader
    uploader = ProductUploader(email, password)
    uploader.run()

if __name__ == "__main__":
    main()
