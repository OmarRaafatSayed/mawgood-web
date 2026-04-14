# Multi-Vendor API Documentation

## Base URL
```
Development: http://localhost:9000
Production: https://api.your-domain.com
```

---

## Store (Public) Endpoints

### 1. List All Active Vendors

**Endpoint:** `GET /store/vendors`

**Description:** Retrieve a list of all active vendors/stores for the Flutter app and storefront.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| offset | number | 0 | Pagination offset |
| limit | number | 20 | Number of results per page |

**Response:**
```json
{
  "sellers": [
    {
      "id": "seller_01HXYZ123",
      "name": "Example Store",
      "handle": "example-store",
      "description": "Quality products since 2020",
      "photo": "https://api.your-domain.com/static/seller-photo.jpg",
      "email": "seller@example.com",
      "store_status": "ACTIVE",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "address": {
        "address_line": "123 Main St",
        "city": "Cairo",
        "country_code": "eg",
        "postal_code": "12345"
      },
      "products_count": 45
    }
  ],
  "count": 1,
  "offset": 0,
  "limit": 20
}
```

**Example (curl):**
```bash
curl -X GET "https://api.your-domain.com/store/vendors?limit=10&offset=0"
```

---

### 2. Get Vendor Products

**Endpoint:** `GET /store/vendors/:id/products`

**Description:** Fetch products belonging to a specific vendor.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Vendor/Seller ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| offset | number | 0 | Pagination offset |
| limit | number | 20 | Number of results |
| category | string | - | Filter by category ID |
| min_price | number | - | Minimum price filter |
| max_price | number | - | Maximum price filter |

**Response:**
```json
{
  "vendor": {
    "id": "seller_01HXYZ123",
    "name": "Example Store",
    "handle": "example-store"
  },
  "products": [
    {
      "id": "prod_01HABC456",
      "title": "Product Title",
      "handle": "product-handle",
      "description": "Product description",
      "status": "published",
      "seller_id": "seller_01HXYZ123",
      "created_at": "2024-01-01T00:00:00Z",
      "variants": [
        {
          "id": "variant_01HDEF789",
          "title": "Default Variant",
          "prices": [
            {
              "amount": 99.99,
              "currency_code": "egp"
            }
          ]
        }
      ],
      "images": [
        {
          "id": "img_01HGGH012",
          "url": "https://api.your-domain.com/static/product.jpg"
        }
      ],
      "categories": [
        {
          "id": "pcat_01HIJK345",
          "name": "Electronics",
          "handle": "electronics"
        }
      ]
    }
  ],
  "count": 1,
  "total_count": 45,
  "offset": 0,
  "limit": 20
}
```

**Example (curl):**
```bash
curl -X GET "https://api.your-domain.com/store/vendors/seller_01HXYZ123/products?limit=20&min_price=50&max_price=500"
```

---

### 3. Get Single Vendor Details

**Endpoint:** `GET /store/seller/:handle`

**Description:** Get detailed information about a specific vendor by handle.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| handle | string | Vendor handle (slug) |

**Response:**
```json
{
  "seller": {
    "id": "seller_01HXYZ123",
    "name": "Example Store",
    "handle": "example-store",
    "description": "Quality products since 2020",
    "photo": "https://api.your-domain.com/static/seller-photo.jpg",
    "email": "seller@example.com",
    "store_status": "ACTIVE",
    "tax_id": "TAX123456",
    "created_at": "2024-01-01T00:00:00Z",
    "address": {
      "address_line": "123 Main St",
      "city": "Cairo",
      "country_code": "eg",
      "postal_code": "12345"
    },
    "reviews": [
      {
        "id": "review_01HLMN678",
        "rating": 5,
        "customer_note": "Great seller!",
        "created_at": "2024-01-15T00:00:00Z",
        "customer": {
          "first_name": "Ahmed",
          "last_name": "Mohamed"
        }
      }
    ],
    "products": [
      {
        "id": "prod_01HABC456",
        "title": "Product Title",
        "handle": "product-handle"
      }
    ]
  }
}
```

**Example (curl):**
```bash
curl -X GET "https://api.your-domain.com/store/seller/example-store"
```

---

## Vendor (Authenticated) Endpoints

### 4. Get Vendor's Own Products

**Endpoint:** `GET /vendor/products`

**Authentication:** Required (Vendor JWT)

**Description:** Get all products for the authenticated vendor.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| offset | number | 0 | Pagination offset |
| limit | number | 50 | Number of results |
| status | string | - | Filter by status: draft, published, proposed, rejected |

**Headers:**
```
Authorization: Bearer <vendor_jwt_token>
```

**Response:**
```json
{
  "products": [
    {
      "id": "prod_01HABC456",
      "title": "My Product",
      "handle": "my-product",
      "status": "published",
      "seller_id": "seller_01HXYZ123",
      "created_at": "2024-01-01T00:00:00Z",
      "variants": [
        {
          "id": "variant_01HDEF789",
          "title": "Default Variant",
          "prices": [
            {
              "amount": 99.99,
              "currency_code": "egp"
            }
          ]
        }
      ],
      "images": [],
      "categories": []
    }
  ],
  "count": 1,
  "offset": 0,
  "limit": 50,
  "vendor": {
    "id": "seller_01HXYZ123",
    "name": "Example Store",
    "handle": "example-store"
  }
}
```

**Example (curl):**
```bash
curl -X GET "https://api.your-domain.com/vendor/products?status=published" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Admin (Authenticated) Endpoints

### 5. List All Vendors (Admin Only)

**Endpoint:** `GET /admin/vendors`

**Authentication:** Required (Admin JWT)

**Description:** Get a list of all vendors (including inactive ones).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| offset | number | 0 | Pagination offset |
| limit | number | 50 | Number of results |
| status | string | - | Filter by status: ACTIVE, SUSPENDED, INACTIVE |

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "vendors": [
    {
      "id": "seller_01HXYZ123",
      "name": "Example Store",
      "handle": "example-store",
      "description": "Quality products",
      "photo": "https://api.your-domain.com/static/seller.jpg",
      "email": "seller@example.com",
      "store_status": "ACTIVE",
      "tax_id": "TAX123456",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "address": {
        "address_line": "123 Main St",
        "city": "Cairo",
        "country_code": "eg",
        "postal_code": "12345"
      },
      "products_count": 45,
      "orders_count": 120
    }
  ],
  "count": 1,
  "offset": 0,
  "limit": 50
}
```

**Example (curl):**
```bash
curl -X GET "https://api.your-domain.com/admin/vendors?status=ACTIVE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 6. Get Vendor Details (Admin Only)

**Endpoint:** `GET /admin/vendors/:id`

**Authentication:** Required (Admin JWT)

**Description:** Get detailed information about a specific vendor including their products.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Vendor ID |

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "vendor": {
    "id": "seller_01HXYZ123",
    "name": "Example Store",
    "handle": "example-store",
    "description": "Quality products",
    "photo": "https://api.your-domain.com/static/seller.jpg",
    "email": "seller@example.com",
    "store_status": "ACTIVE",
    "tax_id": "TAX123456",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "address": {
      "address_line": "123 Main St",
      "city": "Cairo",
      "country_code": "eg",
      "postal_code": "12345"
    },
    "products": [
      {
        "id": "prod_01HABC456",
        "title": "Product Title",
        "handle": "product-handle",
        "status": "published",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 7. Update Vendor (Admin Only)

**Endpoint:** `PATCH /admin/vendors/:id`

**Authentication:** Required (Admin JWT)

**Description:** Update vendor details including approval status.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Vendor ID |

**Request Body:**
```json
{
  "store_status": "ACTIVE",
  "description": "Updated description",
  "tax_id": "TAX123456"
}
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "vendor": {
    "id": "seller_01HXYZ123",
    "name": "Example Store",
    "handle": "example-store",
    "store_status": "ACTIVE",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

**Example (curl):**
```bash
curl -X PATCH "https://api.your-domain.com/admin/vendors/seller_01HXYZ123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"store_status": "ACTIVE", "description": "Updated description"}'
```

---

### 8. Delete Vendor (Admin Only)

**Endpoint:** `DELETE /admin/vendors/:id`

**Authentication:** Required (Admin JWT)

**Description:** Delete a vendor (only if they have no products).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Vendor ID |

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor deleted successfully"
}
```

**Error Response (has products):**
```json
{
  "error": "Cannot delete vendor with existing products",
  "message": "Please reassign or delete the products first"
}
```

---

## Flutter App Integration

### Dart API Service Example

```dart
// lib/services/vendor_api_service.dart

import 'package:http/http.dart' as http;
import 'dart:convert';

class VendorApiService {
  static const String baseUrl = 'https://api.your-domain.com';
  
  // Get all active vendors
  static Future<List<Vendor>> getVendors({int limit = 20, int offset = 0}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/store/vendors?limit=$limit&offset=$offset'),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['sellers'] as List)
          .map((json) => Vendor.fromJson(json))
          .toList();
    }
    throw Exception('Failed to load vendors');
  }
  
  // Get vendor products
  static Future<List<Product>> getVendorProducts({
    required String vendorId,
    int limit = 20,
    double? minPrice,
    double? maxPrice,
  }) async {
    String url = '$baseUrl/store/vendors/$vendorId/products?limit=$limit';
    if (minPrice != null) url += '&min_price=$minPrice';
    if (maxPrice != null) url += '&max_price=$maxPrice';
    
    final response = await http.get(Uri.parse(url));
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['products'] as List)
          .map((json) => Product.fromJson(json))
          .toList();
    }
    throw Exception('Failed to load products');
  }
  
  // Get single vendor by handle
  static Future<Vendor> getVendorByHandle(String handle) async {
    final response = await http.get(
      Uri.parse('$baseUrl/store/seller/$handle'),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Vendor.fromJson(data['seller']);
    }
    throw Exception('Failed to load vendor');
  }
}

class Vendor {
  final String id;
  final String name;
  final String handle;
  final String? description;
  final String? photo;
  final String storeStatus;
  final int? productsCount;
  
  Vendor({
    required this.id,
    required this.name,
    required this.handle,
    this.description,
    this.photo,
    required this.storeStatus,
    this.productsCount,
  });
  
  factory Vendor.fromJson(Map<String, dynamic> json) {
    return Vendor(
      id: json['id'],
      name: json['name'],
      handle: json['handle'],
      description: json['description'],
      photo: json['photo'],
      storeStatus: json['store_status'],
      productsCount: json['products_count'],
    );
  }
}
```

### Flutter Usage Example

```dart
// In your Flutter widget

class VendorListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Vendor>>(
      future: VendorApiService.getVendors(limit: 50),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              final vendor = snapshot.data![index];
              return ListTile(
                leading: vendor.photo != null
                    ? CircleAvatar(
                        backgroundImage: NetworkImage(vendor.photo!),
                      )
                    : CircleAvatar(child: Icon(Icons.store)),
                title: Text(vendor.name),
                subtitle: Text('${vendor.productsCount ?? 0} products'),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => VendorProductsScreen(
                        vendorId: vendor.id,
                        vendorName: vendor.name,
                      ),
                    ),
                  );
                },
              );
            },
          );
        }
        return Center(child: CircularProgressIndicator());
      },
    );
  }
}
```

---

## Authentication

### JWT Token Structure

**Vendor Token:**
```json
{
  "actor_id": "user_01HXYZ",
  "actor_type": "vendor",
  "email": "vendor@store.com",
  "exp": 1704067200
}
```

**Admin Token:**
```json
{
  "actor_id": "user_01HABC",
  "actor_type": "admin",
  "email": "admin@domain.com",
  "exp": 1704067200
}
```

### Getting Auth Tokens

**Login Endpoint:** `POST /auth/user/login`

**Request:**
```json
{
  "email": "vendor@store.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error title",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Example Error Responses

**Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Access denied. Vendor access required."
}
```

**Not Found:**
```json
{
  "error": "Vendor not found"
}
```

---

## Rate Limiting

- **Store endpoints:** 100 requests per minute per IP
- **Authenticated endpoints:** 200 requests per minute per user
- **Admin endpoints:** 500 requests per minute per admin

---

## Webhooks & Events

### Seller Events

| Event | Description |
|-------|-------------|
| `seller.created` | New vendor registered |
| `seller.updated` | Vendor details updated |
| `seller.deleted` | Vendor removed |

### Product Events

| Event | Description |
|-------|-------------|
| `product.created` | New product created |
| `product.updated` | Product modified |
| `product.deleted` | Product removed |

---

## Support

- **Documentation:** https://docs.medusajs.com
- **GitHub:** https://github.com/OmarRaafatSayed/mawgood-web
- **Email:** support@your-domain.com
