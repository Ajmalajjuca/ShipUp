# Order Service API Documentation

This document provides comprehensive information about the Order Service API endpoints, their request/response formats, and usage guidelines.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Order Management](#order-management)
  - [Order Tracking](#order-tracking)
  - [Pricing](#pricing)
  - [Payment](#payment)
  - [Reports](#reports)

## Overview

The Order Service API provides functionality for managing delivery orders, tracking shipments, calculating pricing, processing payments, and generating reports.

## Base URL

```
http://localhost:3004/api
```

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Error Handling

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  // Additional data specific to the endpoint
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## API Endpoints

### Order Management

#### Create Order

Create a new delivery order.

- **URL:** `/orders`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

```json
{
  "userId": "USR-abc123",
  "pickupAddress": {
    "street": "123 Pickup St",
    "city": "Pickup City",
    "state": "PS",
    "zipCode": "12345",
    "country": "India",
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "deliveryAddress": {
    "street": "456 Delivery St",
    "city": "Delivery City",
    "state": "DS",
    "zipCode": "67890",
    "country": "India",
    "latitude": 13.0827,
    "longitude": 80.2707
  },
  "packageDetails": {
    "weight": 5.0,
    "dimensions": {
      "length": 20,
      "width": 15,
      "height": 10
    },
    "category": "document",
    "description": "Important documents"
  },
  "deliveryType": "express",
  "paymentMethod": "wallet"
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "orderId": "ORD-123456",
    "userId": "USR-abc123",
    "partnerId": null,
    "pickupAddress": {
      "street": "123 Pickup St",
      "city": "Pickup City",
      "state": "PS",
      "zipCode": "12345",
      "country": "India",
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "deliveryAddress": {
      "street": "456 Delivery St",
      "city": "Delivery City",
      "state": "DS",
      "zipCode": "67890",
      "country": "India",
      "latitude": 13.0827,
      "longitude": 80.2707
    },
    "packageDetails": {
      "weight": 5.0,
      "dimensions": {
        "length": 20,
        "width": 15,
        "height": 10
      },
      "category": "document",
      "description": "Important documents"
    },
    "deliveryType": "express",
    "status": "pending",
    "price": {
      "basePrice": 150,
      "distanceCharge": 50,
      "weightCharge": 25,
      "expressCharge": 75,
      "tax": 30,
      "totalAmount": 330
    },
    "payment": {
      "method": "wallet",
      "status": "pending",
      "transactionId": null
    },
    "estimatedDeliveryTime": "2023-05-02T14:30:00Z",
    "createdAt": "2023-05-01T12:00:00Z",
    "updatedAt": "2023-05-01T12:00:00Z"
  }
}
```

#### Get Order

Get order details by ID.

- **URL:** `/orders/:orderId`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**

```json
{
  "success": true,
  "order": {
    "orderId": "ORD-123456",
    "userId": "USR-abc123",
    "partnerId": "DRV-abc123",
    "pickupAddress": {
      "street": "123 Pickup St",
      "city": "Pickup City",
      "state": "PS",
      "zipCode": "12345",
      "country": "India",
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "deliveryAddress": {
      "street": "456 Delivery St",
      "city": "Delivery City",
      "state": "DS",
      "zipCode": "67890",
      "country": "India",
      "latitude": 13.0827,
      "longitude": 80.2707
    },
    "packageDetails": {
      "weight": 5.0,
      "dimensions": {
        "length": 20,
        "width": 15,
        "height": 10
      },
      "category": "document",
      "description": "Important documents"
    },
    "deliveryType": "express",
    "status": "in_transit",
    "price": {
      "basePrice": 150,
      "distanceCharge": 50,
      "weightCharge": 25,
      "expressCharge": 75,
      "tax": 30,
      "totalAmount": 330
    },
    "payment": {
      "method": "wallet",
      "status": "completed",
      "transactionId": "TXN-abc123"
    },
    "estimatedDeliveryTime": "2023-05-02T14:30:00Z",
    "createdAt": "2023-05-01T12:00:00Z",
    "updatedAt": "2023-05-01T12:15:00Z",
    "trackingDetails": [
      {
        "status": "order_placed",
        "timestamp": "2023-05-01T12:00:00Z",
        "description": "Order has been placed"
      },
      {
        "status": "payment_completed",
        "timestamp": "2023-05-01T12:05:00Z",
        "description": "Payment has been completed"
      },
      {
        "status": "driver_assigned",
        "timestamp": "2023-05-01T12:10:00Z",
        "description": "Driver has been assigned"
      },
      {
        "status": "pickup_started",
        "timestamp": "2023-05-01T12:15:00Z",
        "description": "Driver is on the way to pickup"
      }
    ]
  }
}
```

#### Get User Orders

Get orders placed by a user.

- **URL:** `/orders/user/:userId`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Parameters:**
  - `status`: Filter by order status (optional)
  - `startDate`: Filter by start date (optional, format: YYYY-MM-DD)
  - `endDate`: Filter by end date (optional, format: YYYY-MM-DD)
  - `page`: Page number for pagination (optional, default: 1)
  - `limit`: Number of orders per page (optional, default: 10)
- **Success Response:**

```json
{
  "success": true,
  "orders": [
    {
      "orderId": "ORD-123456",
      "userId": "USR-abc123",
      "partnerId": "DRV-abc123",
      "status": "in_transit",
      "deliveryType": "express",
      "createdAt": "2023-05-01T12:00:00Z",
      "estimatedDeliveryTime": "2023-05-02T14:30:00Z",
      "price": {
        "totalAmount": 330
      },
      "payment": {
        "status": "completed"
      }
    },
    // ... more orders
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Update Order Status

Update the status of an order.

- **URL:** `/orders/:orderId/status`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:**

```json
{
  "status": "delivered",
  "description": "Package delivered to customer"
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "orderId": "ORD-123456",
    "status": "delivered",
    "updatedAt": "2023-05-02T14:15:00Z",
    "trackingDetails": [
      // ... previous tracking details
      {
        "status": "delivered",
        "timestamp": "2023-05-02T14:15:00Z",
        "description": "Package delivered to customer"
      }
    ]
  }
}
```

#### Cancel Order

Cancel an order.

- **URL:** `/orders/:orderId/cancel`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

```json
{
  "reason": "Changed my mind",
  "cancelledBy": "user"
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "orderId": "ORD-123456",
    "status": "cancelled",
    "updatedAt": "2023-05-01T13:00:00Z",
    "cancellationDetails": {
      "reason": "Changed my mind",
      "cancelledBy": "user",
      "timestamp": "2023-05-01T13:00:00Z"
    },
    "refundDetails": {
      "status": "processing",
      "amount": 330,
      "estimatedCompletionTime": "2023-05-03T13:00:00Z"
    }
  }
}
```

#### Assign Driver

Assign a driver to an order.

- **URL:** `/orders/:orderId/assign`
- **Method:** `POST`
- **Auth Required:** Yes (admin)
- **Request Body:**

```json
{
  "partnerId": "DRV-abc123"
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Driver assigned successfully",
  "order": {
    "orderId": "ORD-123456",
    "partnerId": "DRV-abc123",
    "status": "driver_assigned",
    "updatedAt": "2023-05-01T12:10:00Z",
    "trackingDetails": [
      // ... previous tracking details
      {
        "status": "driver_assigned",
        "timestamp": "2023-05-01T12:10:00Z",
        "description": "Driver has been assigned"
      }
    ]
  }
}
```

### Order Tracking

#### Get Tracking Details

Get detailed tracking information for an order.

- **URL:** `/orders/:orderId/tracking`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**

```json
{
  "success": true,
  "tracking": {
    "orderId": "ORD-123456",
    "currentStatus": "in_transit",
    "estimatedDeliveryTime": "2023-05-02T14:30:00Z",
    "trackingDetails": [
      {
        "status": "order_placed",
        "timestamp": "2023-05-01T12:00:00Z",
        "description": "Order has been placed"
      },
      {
        "status": "payment_completed",
        "timestamp": "2023-05-01T12:05:00Z",
        "description": "Payment has been completed"
      },
      {
        "status": "driver_assigned",
        "timestamp": "2023-05-01T12:10:00Z",
        "description": "Driver has been assigned"
      },
      {
        "status": "pickup_started",
        "timestamp": "2023-05-01T12:15:00Z",
        "description": "Driver is on the way to pickup"
      },
      {
        "status": "package_picked_up",
        "timestamp": "2023-05-01T12:45:00Z",
        "description": "Package has been picked up"
      },
      {
        "status": "in_transit",
        "timestamp": "2023-05-01T12:50:00Z",
        "description": "Package is in transit to delivery location"
      }
    ],
    "driverInfo": {
      "partnerId": "DRV-abc123",
      "fullName": "John Driver",
      "phone": "+919876543210",
      "currentLocation": {
        "latitude": 12.9855,
        "longitude": 77.6037,
        "lastUpdated": "2023-05-01T13:30:00Z"
      },
      "vehicleDetails": {
        "vehicleType": "Bike",
        "vehicleNumber": "XY12A3456"
      }
    }
  }
}
```

#### Update Driver Location

Update the current location of a driver.

- **URL:** `/tracking/location`
- **Method:** `POST`
- **Auth Required:** Yes (driver)
- **Request Body:**

```json
{
  "partnerId": "DRV-abc123",
  "orderId": "ORD-123456",
  "location": {
    "latitude": 12.9855,
    "longitude": 77.6037
  }
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Location updated successfully"
}
```

### Pricing

#### Calculate Delivery Price

Calculate the delivery price for a potential order.

- **URL:** `/pricing/calculate`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

```json
{
  "pickupLocation": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "deliveryLocation": {
    "latitude": 13.0827,
    "longitude": 80.2707
  },
  "packageDetails": {
    "weight": 5.0,
    "dimensions": {
      "length": 20,
      "width": 15,
      "height": 10
    },
    "category": "document"
  },
  "deliveryType": "express"
}
```

- **Success Response:**

```json
{
  "success": true,
  "pricing": {
    "basePrice": 150,
    "distanceCharge": 50,
    "weightCharge": 25,
    "expressCharge": 75,
    "tax": 30,
    "totalAmount": 330,
    "currency": "INR",
    "breakdown": {
      "distance": "350 km",
      "estimatedTime": "6 hours",
      "weightCategory": "0-5 kg",
      "taxRate": "10%"
    }
  }
}
```

#### Get Price Tiers

Get all available pricing tiers and options.

- **URL:** `/pricing/tiers`
- **Method:** `GET`
- **Auth Required:** No
- **Success Response:**

```json
{
  "success": true,
  "pricingTiers": {
    "basePrice": 100,
    "deliveryTypes": [
      {
        "type": "standard",
        "multiplier": 1.0,
        "estimatedTime": "1-2 days",
        "description": "Standard delivery"
      },
      {
        "type": "express",
        "multiplier": 1.5,
        "estimatedTime": "Same day",
        "description": "Express delivery"
      },
      {
        "type": "premium",
        "multiplier": 2.0,
        "estimatedTime": "3-5 hours",
        "description": "Premium delivery with priority handling"
      }
    ],
    "weightCategories": [
      {
        "range": "0-5 kg",
        "charge": 25
      },
      {
        "range": "5-10 kg",
        "charge": 50
      },
      {
        "range": "10-20 kg",
        "charge": 100
      },
      {
        "range": "20+ kg",
        "charge": 200
      }
    ],
    "distanceRates": {
      "baseDistance": "0-5 km",
      "baseCharge": 20,
      "additionalRate": "5 per km"
    },
    "taxRate": "10%"
  }
}
```

### Payment

#### Process Payment

Process payment for an order.

- **URL:** `/payments/process`
- **Method:** `POST`
- **Auth Required:** Yes
- **Request Body:**

```json
{
  "orderId": "ORD-123456",
  "method": "card",
  "paymentDetails": {
    "cardNumber": "XXXX-XXXX-XXXX-1234",
    "expiryDate": "12/25",
    "cvv": "***",
    "name": "John Doe"
  }
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "payment": {
    "transactionId": "TXN-abc123",
    "orderId": "ORD-123456",
    "amount": 330,
    "method": "card",
    "status": "completed",
    "timestamp": "2023-05-01T12:05:00Z"
  }
}
```

#### Get Payment Status

Get payment status for an order.

- **URL:** `/payments/order/:orderId`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**

```json
{
  "success": true,
  "payment": {
    "transactionId": "TXN-abc123",
    "orderId": "ORD-123456",
    "amount": 330,
    "method": "card",
    "status": "completed",
    "timestamp": "2023-05-01T12:05:00Z"
  }
}
```

#### Process Refund

Process refund for a cancelled order.

- **URL:** `/payments/refund`
- **Method:** `POST`
- **Auth Required:** Yes (admin)
- **Request Body:**

```json
{
  "orderId": "ORD-123456",
  "amount": 330,
  "reason": "Order cancelled by user"
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Refund initiated successfully",
  "refund": {
    "refundId": "RFD-abc123",
    "orderId": "ORD-123456",
    "transactionId": "TXN-abc123",
    "amount": 330,
    "status": "processing",
    "reason": "Order cancelled by user",
    "timestamp": "2023-05-01T13:05:00Z",
    "estimatedCompletionTime": "2023-05-03T13:05:00Z"
  }
}
```

### Reports

#### Generate Order Report

Generate a report of orders for a specific period.

- **URL:** `/reports/orders`
- **Method:** `GET`
- **Auth Required:** Yes (admin)
- **Query Parameters:**
  - `startDate`: Start date (format: YYYY-MM-DD)
  - `endDate`: End date (format: YYYY-MM-DD)
  - `status`: Filter by order status (optional)
  - `format`: Report format (pdf, csv, json, default: json)
- **Success Response (JSON format):**

```json
{
  "success": true,
  "report": {
    "period": {
      "startDate": "2023-05-01",
      "endDate": "2023-05-31"
    },
    "summary": {
      "totalOrders": 150,
      "completedOrders": 120,
      "cancelledOrders": 10,
      "pendingOrders": 20,
      "totalRevenue": 45000,
      "averageOrderValue": 300
    },
    "statusBreakdown": {
      "pending": 5,
      "payment_pending": 5,
      "driver_assigned": 5,
      "pickup_started": 5,
      "package_picked_up": 5,
      "in_transit": 5,
      "out_for_delivery": 5,
      "delivered": 120,
      "cancelled": 10
    },
    "orders": [
      {
        "orderId": "ORD-123456",
        "userId": "USR-abc123",
        "partnerId": "DRV-abc123",
        "status": "delivered",
        "deliveryType": "express",
        "createdAt": "2023-05-01T12:00:00Z",
        "deliveredAt": "2023-05-02T14:15:00Z",
        "price": {
          "totalAmount": 330
        },
        "payment": {
          "status": "completed"
        }
      },
      // ... more orders
    ]
  }
}
```

#### Generate Revenue Report

Generate a revenue report for a specific period.

- **URL:** `/reports/revenue`
- **Method:** `GET`
- **Auth Required:** Yes (admin)
- **Query Parameters:**
  - `startDate`: Start date (format: YYYY-MM-DD)
  - `endDate`: End date (format: YYYY-MM-DD)
  - `groupBy`: Group by (day, week, month, default: day)
  - `format`: Report format (pdf, csv, json, default: json)
- **Success Response (JSON format):**

```json
{
  "success": true,
  "report": {
    "period": {
      "startDate": "2023-05-01",
      "endDate": "2023-05-31"
    },
    "summary": {
      "totalRevenue": 45000,
      "totalOrders": 150,
      "averageOrderValue": 300,
      "highestRevenueDay": "2023-05-15",
      "highestRevenueDayAmount": 3000
    },
    "revenueBreakdown": {
      "byDeliveryType": {
        "standard": 15000,
        "express": 20000,
        "premium": 10000
      },
      "byPaymentMethod": {
        "card": 25000,
        "wallet": 15000,
        "upi": 5000
      }
    },
    "timeline": [
      {
        "date": "2023-05-01",
        "revenue": 1500,
        "orders": 5
      },
      {
        "date": "2023-05-02",
        "revenue": 1800,
        "orders": 6
      },
      // ... more days
    ]
  }
}
```

## Status Codes

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: The user does not have permission
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

## Error Messages

- `Missing required fields`: One or more required fields are missing
- `Order not found`: The requested order does not exist
- `Invalid order status`: The provided order status is invalid
- `Payment failed`: The payment could not be processed
- `Driver not available`: The requested driver is not available
- `Internal server error`: An unexpected error occurred on the server
- `Invalid location`: The provided location coordinates are invalid 