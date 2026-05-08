"""
Mawgood Product Importer - Smart Version
=========================================
يشتغل في حالتين:
  1. Excel فيه صور في الأعمدة → يستخدمها مباشرة
  2. Excel مفيش فيه صور     → يعمل matching تلقائي من صور السيرفر بالـ SKU prefix

الاستخدام:
  python import_products.py
  python import_products.py --file "H-I-X.xlsx"
  python import_products.py --file "new_vendor.xlsx" --images-dir "C:/path/to/images"
  python import_products.py --no-delete   (بدون حذف المنتجات القديمة)
"""

import pandas as pd
import requests
import os
import sys
import re
import time
import json
import argparse
import getpass
from pathlib import Path
from typing import Optional

# ─── Config ───────────────────────────────────────────────────────────────────
BACKEND_URL   = "http://localhost:9000"
PUB_KEY       = "pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53"
DATA_DIR      = Path(r"C:\Users\EXPRESS\Downloads\coding\MawgoodWep\data-products")
STATIC_DIR    = Path(r"C:\Users\EXPRESS\Downloads\coding\MawgoodWep\backend\static\extracted-images")
STATIC_URL    = f"{BACKEND_URL}/static/extracted-images"

# الملفات الافتراضية
DEFAULT_FILES = [
    "H-I-X.xlsx",
    "H&S.xlsx",
    "Rehab Lafy.xlsx",
    "مصنع E-S-H.xlsx",
]

# ─── SKU prefix → image folder prefix mapping ─────────────────────────────────
# الـ script بيحاول يعمل match تلقائي، بس ممكن تضيف هنا mappings إضافية
SKU_IMAGE_MAP = [
    (r"^HIX",                    "H-I-X"),
    (r"^ESH",                    "E-S-H-Factory"),
    (r"^(HR|KR|GL|FT|YS|WA|DJ|LV|BS|EM|R\d|TN|K2|SL|B1)", "Rehab-Lafy"),
    (r"^\d",                     "H-S"),   # codes that start with a number
    (r"^A0",                     "H-S"),
]

# ─── Helpers ──────────────────────────────────────────────────────────────────

def clean_code(raw) -> str:
    """Normalize product code to a clean SKU-safe string"""
    s = str(raw or "").strip()
    s = re.sub(r"\s*/\s*", "-", s)   # HR318 / G-10  →  HR318-G-10
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^A-Za-z0-9\-]", "", s)
    return s.upper()


def make_handle(code: str) -> str:
    return code.lower().replace("/", "-").replace(" ", "-")


def parse_multiline(cell, bullet="●") -> list[str]:
    """Split a cell that has newline-separated values (with optional bullet chars)"""
    if pd.isna(cell) or not str(cell).strip():
        return []
    text = str(cell).replace(bullet, "").replace("●", "")
    items = [x.strip() for x in re.split(r"[\n,،]", text) if x.strip()]
    return items


def get_price_cents(egp_cell, sar_cell) -> int:
    """Return price in smallest unit (qirsh). Always multiply by 100."""
    for cell in (egp_cell, sar_cell):
        if not pd.isna(cell) and str(cell).strip():
            try:
                val = float(re.sub(r"[^\d.]", "", str(cell)))
                if val > 0:
                    # If SAR, convert to EGP first (approx 1 SAR = 13 EGP)
                    if cell is sar_cell:
                        val = val * 13
                    return int(round(val * 100))
            except ValueError:
                pass
    return 10_000   # fallback: 100 EGP


# ─── Image resolution ─────────────────────────────────────────────────────────

def _load_server_images() -> dict[str, list[str]]:
    """Index all images on the server grouped by prefix"""
    groups: dict[str, list[str]] = {}
    if not STATIC_DIR.exists():
        return groups
    for f in STATIC_DIR.iterdir():
        if f.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        # Detect prefix (e.g. H-I-X, H-S, Rehab-Lafy, E-S-H-Factory)
        for prefix in ("E-S-H-Factory", "Rehab-Lafy", "H-I-X", "H-S"):
            if f.name.startswith(prefix + "-"):
                groups.setdefault(prefix, []).append(f.name)
                break
    # Sort numerically within each group
    for prefix in groups:
        groups[prefix].sort(key=lambda n: int(re.search(r"(\d+)", n).group(1)) if re.search(r"(\d+)", n) else 0)
    return groups


SERVER_IMAGES = _load_server_images()


def get_image_url_from_excel(row, img_cols: list[str]) -> list[str]:
    """Extract image URLs from Excel image columns (if they exist and are not empty)"""
    urls = []
    for col in img_cols:
        val = str(row.get(col, "") or "").strip()
        if val and val.lower() not in ("nan", "none", ""):
            # If it's already a URL keep it, otherwise treat as filename
            if val.startswith("http"):
                urls.append(val)
            else:
                urls.append(f"{STATIC_URL}/{val}")
    return urls


def get_image_url_from_sku(sku: str, product_index: int) -> list[str]:
    """Auto-match image from server based on SKU prefix"""
    for pattern, prefix in SKU_IMAGE_MAP:
        if re.match(pattern, sku, re.IGNORECASE):
            images = SERVER_IMAGES.get(prefix, [])
            if images:
                img = images[product_index % len(images)]
                return [f"{STATIC_URL}/{img}"]
    # Fallback: pick any available image
    for prefix, images in SERVER_IMAGES.items():
        if images:
            img = images[product_index % len(images)]
            return [f"{STATIC_URL}/{img}"]
    return []


# ─── Product builder ──────────────────────────────────────────────────────────

def build_payload(row: pd.Series, file_name: str, img_cols: list[str], product_index: int) -> Optional[dict]:
    code_raw = row.get("CODE") or row.get("Code")
    if pd.isna(code_raw) or not str(code_raw).strip():
        return None

    code    = clean_code(code_raw)
    title   = str(row.get("وصف المنتج", "") or "").strip()
    category= str(row.get("الصنف", "") or "").strip()
    handle  = make_handle(code)

    if not title:
        title = f"{category} {code}".strip() or f"Product {code}"

    colors = parse_multiline(row.get("اللون", ""))
    sizes  = parse_multiline(row.get("المقاس", ""))

    egp_col = next((c for c in row.index if "جنيه" in str(c)), None)
    sar_col = next((c for c in row.index if "ريال" in str(c)), None)
    price_cents = get_price_cents(
        row.get(egp_col) if egp_col else None,
        row.get(sar_col) if sar_col else None,
    )

    # ── Images ──
    image_urls = get_image_url_from_excel(row, img_cols)
    if not image_urls:
        image_urls = get_image_url_from_sku(code, product_index)

    # ── Options & Variants ──
    options  = []
    if colors:
        options.append({"title": "Color", "values": colors})
    if sizes:
        options.append({"title": "Size", "values": sizes})
    if not options:
        options = [{"title": "Default", "values": ["Default"]}]

    variants = []
    rank = 0
    if len(options) == 1:
        for val in options[0]["values"]:
            variants.append({
                "title": val,
                "sku": f"{code}-{val}".replace(" ", "-"),
                "manage_inventory": False,
                "allow_backorder": True,
                "options": {options[0]["title"]: val},
                "variant_rank": rank,
                "prices": [{"currency_code": "egp", "amount": price_cents}],
            })
            rank += 1
    else:
        for color in options[0]["values"]:
            for size in options[1]["values"]:
                variants.append({
                    "title": f"{color} / {size}",
                    "sku": f"{code}-{color}-{size}".replace(" ", "-"),
                    "manage_inventory": False,
                    "allow_backorder": True,
                    "options": {options[0]["title"]: color, options[1]["title"]: size},
                    "variant_rank": rank,
                    "prices": [{"currency_code": "egp", "amount": price_cents}],
                })
                rank += 1

    payload = {
        "title": title,
        "subtitle": f"كود: {code}",
        "handle": handle,
        "description": f"{title}\nالصنف: {category}\nالكود: {code}",
        "status": "published",
        "discountable": True,
        "options": options,
        "variants": variants,
        "images": [{"url": u} for u in image_urls],
        "thumbnail": image_urls[0] if image_urls else None,
        "is_giftcard": False,
    }
    return payload


# ─── Uploader ─────────────────────────────────────────────────────────────────

class Importer:
    def __init__(self, email: str, password: str, delete_existing: bool):
        self.session = requests.Session()
        self.delete_existing = delete_existing
        self.stats = {"total": 0, "ok": 0, "fail": 0, "skip": 0, "errors": []}
        self._auth(email, password)

    def _auth(self, email: str, password: str):
        r = self.session.post(
            f"{BACKEND_URL}/admin/auth/token",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
        )
        if r.status_code != 200:
            print(f"✗ Auth failed ({r.status_code}): {r.text[:200]}")
            sys.exit(1)
        token = r.json().get("token")
        self.session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        })
        print(f"✓ Authenticated as {email}\n")

    def _delete_all(self):
        print("🗑  Deleting existing products...")
        offset, deleted = 0, 0
        while True:
            r = self.session.get(f"{BACKEND_URL}/admin/products", params={"limit": 50, "offset": offset})
            products = r.json().get("products", [])
            if not products:
                break
            for p in products:
                dr = self.session.delete(f"{BACKEND_URL}/admin/products/{p['id']}")
                if dr.status_code in (200, 204):
                    deleted += 1
                time.sleep(0.03)
            offset += 50
        print(f"   Deleted {deleted} products\n")

    def _upload(self, payload: dict, label: str) -> bool:
        r = self.session.post(f"{BACKEND_URL}/admin/products", json=payload)
        if r.status_code in (200, 201):
            self.stats["ok"] += 1
            pid = r.json().get("product", {}).get("id", "?")
            print(f"  ✓ {label[:60]}  (id: {pid})")
            return True
        else:
            self.stats["fail"] += 1
            err = f"HTTP {r.status_code}: {r.text[:150]}"
            self.stats["errors"].append({"label": label, "error": err})
            print(f"  ✗ {label[:60]}  → {err}")
            return False

    def process_file(self, file_path: Path):
        print(f"\n{'='*70}")
        print(f"📄  {file_path.name}")
        print(f"{'='*70}")

        df = pd.read_excel(file_path, sheet_name=0)
        print(f"   {len(df)} rows found")

        # Detect image columns (any column whose name contains 'صور')
        img_cols = [c for c in df.columns if "صور" in str(c)]
        print(f"   Image columns: {img_cols or 'none (will auto-match from server)'}\n")

        product_index = 0
        for idx, row in df.iterrows():
            code_raw = row.get("CODE") or row.get("Code")
            if pd.isna(code_raw) or not str(code_raw).strip():
                self.stats["skip"] += 1
                continue

            self.stats["total"] += 1
            payload = build_payload(row, file_path.name, img_cols, product_index)
            if not payload:
                self.stats["skip"] += 1
                continue

            self._upload(payload, f"[{file_path.stem}] {payload['title']}")
            product_index += 1
            time.sleep(0.1)

    def run(self, files: list[Path]):
        if self.delete_existing:
            self._delete_all()

        for f in files:
            if not f.exists():
                print(f"⚠  File not found: {f}")
                continue
            self.process_file(f)

        # ── Summary ──
        s = self.stats
        print(f"\n{'='*70}")
        print(f"📊  SUMMARY")
        print(f"{'='*70}")
        print(f"   Total processed : {s['total']}")
        print(f"   ✓ Uploaded       : {s['ok']}")
        print(f"   ✗ Failed         : {s['fail']}")
        print(f"   ⊘ Skipped        : {s['skip']}")

        if s["errors"]:
            print(f"\n   First {min(10, len(s['errors']))} errors:")
            for e in s["errors"][:10]:
                print(f"   • {e['label'][:50]} → {e['error'][:100]}")

        print(f"\n{'='*70}")
        print("✅  Done!")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Mawgood Product Importer")
    parser.add_argument("--file",       help="Excel file name (inside data-products/) or full path")
    parser.add_argument("--no-delete",  action="store_true", help="Don't delete existing products first")
    parser.add_argument("--email",      help="Admin email (will prompt if not given)")
    parser.add_argument("--password",   help="Admin password (will prompt if not given)")
    args = parser.parse_args()

    print("=" * 70)
    print("  MAWGOOD PRODUCT IMPORTER")
    print("=" * 70)

    email    = args.email    or input("Admin email: ").strip()
    password = args.password or getpass.getpass("Admin password: ")

    # Resolve files
    if args.file:
        p = Path(args.file)
        files = [p if p.is_absolute() else DATA_DIR / p]
    else:
        files = [DATA_DIR / f for f in DEFAULT_FILES]

    delete = not args.no_delete
    if delete:
        print("\n⚠  This will DELETE all existing products first.")
        confirm = input("Type YES to continue: ").strip()
        if confirm != "YES":
            print("Cancelled.")
            return

    importer = Importer(email, password, delete)
    importer.run(files)


if __name__ == "__main__":
    main()
