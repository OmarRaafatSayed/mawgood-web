import pandas as pd
import requests
import json
import os
from typing import List, Dict, Any
import time

# Configuration
BACKEND_URL = "http://localhost:9000"
PUBLISHABLE_KEY = "pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53"
DATA_DIR = r"C:\Users\EXPRESS\Downloads\coding\MawgoodWep\data-products"

# Admin credentials - you may need to update these
ADMIN_EMAIL = input("Enter admin email: ")
ADMIN_PASSWORD = input("Enter admin password: ")

# Excel files to process
EXCEL_FILES = [
    "H-I-X.xlsx",
    "H&S.xlsx",
    "Rehab Lafy.xlsx",
    "مصنع E-S-H.xlsx"
]

class ProductUploader:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.stats = {
            "total": 0,
            "success": 0,
            "failed": 0,
            "errors": []
        }
    
    def authenticate(self):
        """Authenticate with the backend"""
        print("\n" + "="*80)
        print("AUTHENTICATING")
        print("="*80)
        
        try:
            # Login to get auth token
            response = self.session.post(
                f"{BACKEND_URL}/auth/user/emailpass",
                json={
                    "email": ADMIN_EMAIL,
                    "password": ADMIN_PASSWORD
                },
                headers={
                    "Content-Type": "application/json",
                    "x-publishable-api-key": PUBLISHABLE_KEY
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("token")
                
                # Update session headers
                self.session.headers.update({
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.auth_token}",
                    "x-publishable-api-key": PUBLISHABLE_KEY
                })
                
                print("✓ Authentication successful")
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
            return ["Default"]
        
        # Remove bullets and split by newline
        colors = color_str.replace("●", "").strip().split("\n")
        colors = [c.strip() for c in colors if c.strip()]
        
        return colors if colors else ["Default"]
    
    def parse_sizes(self, size_str: str) -> List[str]:
        """Parse size string and extract individual sizes"""
        if pd.isna(size_str) or not size_str:
            return ["One Size"]
        
        # Clean and split sizes
        size_str = size_str.replace("ك", "").replace(":", "-")
        sizes = size_str.split("\n")
        sizes = [s.strip() for s in sizes if s.strip()]
        
        return sizes if sizes else ["One Size"]
    
    def clean_text(self, text: Any) -> str:
        """Clean and normalize text"""
        if pd.isna(text) or text is None:
            return ""
        return str(text).strip()
    
    def get_price(self, egp_price: Any, sar_price: Any) -> float:
        """Get price in EGP, fallback to SAR conversion if needed"""
        if not pd.isna(egp_price) and egp_price:
            return float(egp_price)
        elif not pd.isna(sar_price) and sar_price:
            # Convert SAR to EGP (approximate rate: 1 SAR = 13 EGP)
            return float(sar_price) * 13
        else:
            return 100.0  # Default price
    
    def create_product_payload(self, row: pd.Series, file_name: str) -> Dict[str, Any]:
        """Create product payload from Excel row"""
        
        # Extract data
        code = self.clean_text(row.get('CODE') or row.get('Code'))
        title = self.clean_text(row.get('وصف المنتج', ''))
        category = self.clean_text(row.get('الصنف', ''))
        
        # Parse colors and sizes
        colors = self.parse_colors(row.get('اللون', ''))
        sizes = self.parse_sizes(row.get('المقاس', ''))
        
        # Get price
        egp_price = row.get('السعر بالجنيه') or row.get('السعر بالجنيه ')
        sar_price = row.get('السعر بالريال')
        price = self.get_price(egp_price, sar_price)
        
        # Generate handle from code
        handle = code.lower().replace(" ", "-").replace("/", "-") if code else f"product-{int(time.time())}"
        
        # Create title if empty
        if not title:
            title = f"{category} {code}" if code else f"Product {handle}"
        
        # Create options
        options = []
        if len(colors) > 1 or colors[0] != "Default":
            options.append({
                "title": "اللون",
                "values": colors
            })
        
        if len(sizes) > 1 or sizes[0] != "One Size":
            options.append({
                "title": "المقاس",
                "values": sizes
            })
        
        # If no options, create default
        if not options:
            options = [{
                "title": "Default",
                "values": ["Default"]
            }]
        
        # Create variants
        variants = []
        variant_rank = 0
        
        if len(options) == 1:
            # Single option
            for value in options[0]["values"]:
                variant = {
                    "title": f"{title} - {value}",
                    "sku": f"{code}-{value}".replace(" ", "-") if code else None,
                    "manage_inventory": False,
                    "allow_backorder": True,
                    "options": {options[0]["title"]: value},
                    "variant_rank": variant_rank,
                    "prices": {
                        "egp": price * 100  # Convert to cents
                    }
                }
                variants.append(variant)
                variant_rank += 1
        
        elif len(options) == 2:
            # Two options (color and size)
            for color in options[0]["values"]:
                for size in options[1]["values"]:
                    variant = {
                        "title": f"{title} - {color} - {size}",
                        "sku": f"{code}-{color}-{size}".replace(" ", "-") if code else None,
                        "manage_inventory": False,
                        "allow_backorder": True,
                        "options": {
                            options[0]["title"]: color,
                            options[1]["title"]: size
                        },
                        "variant_rank": variant_rank,
                        "prices": {
                            "egp": price * 100  # Convert to cents
                        }
                    }
                    variants.append(variant)
                    variant_rank += 1
        
        # Create product payload
        payload = {
            "title": title,
            "subtitle": f"كود: {code}" if code else "",
            "handle": handle,
            "description": f"{title}\nالصنف: {category}\nالمصدر: {file_name}",
            "status": "published",
            "discountable": True,
            "options": options,
            "variants": variants,
            "categories": [],
            "tags": [category] if category else [],
            "material": "",
            "origin_country": "EG"
        }
        
        return payload
    
    def delete_all_products(self):
        """Delete all existing products"""
        print("\n" + "="*80)
        print("DELETING ALL EXISTING PRODUCTS")
        print("="*80)
        
        try:
            # Get all products
            response = self.session.get(f"{BACKEND_URL}/admin/products?limit=1000")
            
            if response.status_code != 200:
                print(f"Failed to fetch products: {response.status_code}")
                print(f"Response: {response.text}")
                return
            
            data = response.json()
            products = data.get("products", [])
            
            print(f"\nFound {len(products)} products to delete")
            
            # Delete each product
            deleted = 0
            for product in products:
                product_id = product.get("id")
                try:
                    del_response = self.session.delete(f"{BACKEND_URL}/admin/products/{product_id}")
                    if del_response.status_code in [200, 204]:
                        deleted += 1
                        print(f"✓ Deleted product: {product.get('title', product_id)}")
                    else:
                        print(f"✗ Failed to delete {product_id}: {del_response.status_code}")
                except Exception as e:
                    print(f"✗ Error deleting {product_id}: {str(e)}")
                
                time.sleep(0.1)  # Small delay to avoid overwhelming the API
            
            print(f"\n✓ Successfully deleted {deleted} products")
            
        except Exception as e:
            print(f"✗ Error during deletion: {str(e)}")
    
    def upload_product(self, payload: Dict[str, Any], row_num: int, file_name: str) -> bool:
        """Upload a single product"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/admin/products",
                json=payload
            )
            
            if response.status_code in [200, 201]:
                self.stats["success"] += 1
                print(f"✓ [{file_name}] Row {row_num}: {payload['title']}")
                return True
            else:
                self.stats["failed"] += 1
                error_msg = f"Failed (HTTP {response.status_code}): {response.text[:200]}"
                self.stats["errors"].append({
                    "file": file_name,
                    "row": row_num,
                    "title": payload['title'],
                    "error": error_msg
                })
                print(f"✗ [{file_name}] Row {row_num}: {error_msg}")
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
            print(f"✗ [{file_name}] Row {row_num}: {error_msg}")
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
            
            # Process each row
            for idx, row in df.iterrows():
                # Skip empty rows
                code = row.get('CODE') or row.get('Code')
                if pd.isna(code) or not str(code).strip():
                    continue
                
                self.stats["total"] += 1
                
                # Create payload
                payload = self.create_product_payload(row, file_name)
                
                # Upload product
                self.upload_product(payload, idx + 2, file_name)  # +2 for Excel row number
                
                # Small delay to avoid overwhelming the API
                time.sleep(0.2)
            
        except Exception as e:
            print(f"✗ Error processing file {file_name}: {str(e)}")
    
    def run(self):
        """Main execution"""
        print("\n" + "="*80)
        print("MAWGOOD PRODUCT UPLOADER")
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
        
        if self.stats["errors"]:
            print(f"\n{'='*80}")
            print("ERRORS:")
            print(f"{'='*80}")
            for error in self.stats["errors"][:10]:  # Show first 10 errors
                print(f"\nFile: {error['file']}")
                print(f"Row: {error['row']}")
                print(f"Title: {error['title']}")
                print(f"Error: {error['error']}")
        
        print("\n" + "="*80)
        print("UPLOAD COMPLETE")
        print("="*80)

if __name__ == "__main__":
    uploader = ProductUploader()
    uploader.run()
