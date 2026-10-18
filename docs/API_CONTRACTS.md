# AgroSaathi - API Contracts & Communication Standards

## 1. Global Response Envelope

All API endpoints must conform to the unified JSON response envelope to ensure predictable client parsing and type-safety across modules.

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string; // ISO-8601 string
}
```

---

## 2. Health Check Endpoint

### `GET /api/health`
Validates that the service is running, reports deployment environment, and checks database connectivity if configured.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-10-17T09:30:00.000Z",
    "version": "0.1.0",
    "database": "connected | offline_mock",
    "environment": "development"
  },
  "timestamp": "2026-10-17T09:30:00.000Z"
}
```

---

## 3. Feature API Contracts

### A. Crop Disease Detection (Owner: Lead)
- **Endpoint**: `POST /api/crop-disease/detect`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Body**:
  ```json
  {
    "cropType": "tomato",
    "image": "data:image/jpeg;base64,...",
    "notes": "Spotted brown rings on lower leaves"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "diagnosis": "Tomato - Early Blight",
      "scientificName": "Alternaria solani",
      "confidence": 0.92,
      "severity": "moderate",
      "summary": "Early blight is a common fungal disease causing dark brown spots with concentric target-like rings.",
      "recommendedActions": [
        "Remove and destroy infected foliage",
        "Apply recommended copper or Mancozeb fungicide",
        "Avoid overhead sprinkler irrigation",
        "Ensure 60cm plant spacing for air circulation"
      ],
      "disclaimer": "AI-assisted triage. Verify with local Krishi Vigyan Kendra (KVK) officer."
    },
    "timestamp": "2026-10-17T09:30:00.000Z"
  }
  ```

---

### B. Mandi Price Intelligence (Owner: Member 2)
- **Endpoint**: `GET /api/mandi-prices`
- **Query Parameters**:
  - `crop`: string (e.g., `tomato`)
  - `state`: string (e.g., `rajasthan`)
  - `district`: string (e.g., `jaipur`)
  - `range`: `7d` | `1m` | `3m` | `6m`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "crop": "Tomato",
      "state": "Rajasthan",
      "district": "Jaipur",
      "selectedMarket": "Jaipur Mandi",
      "statistics": {
        "minPrice": 1200,
        "modalPrice": 1850,
        "maxPrice": 2300,
        "unit": "₹/Quintal",
        "totalArrival": "1,250 Tonnes"
      },
      "nearbyMarkets": [
        { "name": "Jaipur Mandi", "distanceKm": 25, "price": 1850, "trendPercent": 12 },
        { "name": "Sanganer Mandi", "distanceKm": 32, "price": 1720, "trendPercent": 8 },
        { "name": "Phagi Mandi", "distanceKm": 45, "price": 1650, "trendPercent": -3 },
        { "name": "Chomu Mandi", "distanceKm": 48, "price": 1580, "trendPercent": -5 }
      ],
      "trends": [
        { "date": "10 Oct", "price": 1500 },
        { "date": "11 Oct", "price": 1600 },
        { "date": "12 Oct", "price": 1620 },
        { "date": "13 Oct", "price": 1750 },
        { "date": "14 Oct", "price": 1710 },
        { "date": "15 Oct", "price": 1800 },
        { "date": "16 Oct", "price": 1850 }
      ]
    },
    "timestamp": "2026-10-17T09:30:00.000Z"
  }
  ```

---

### C. Smart Irrigation Advisor (Owner: Member 3)
- **Endpoint**: `POST /api/irrigation/calculate`
- **Request Body**:
  ```json
  {
    "crop": "tomato",
    "growthStage": "flowering",
    "soilType": "loamy",
    "fieldLocation": "Jaipur, Rajasthan",
    "lastIrrigatedDate": "2026-10-14"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "needLevel": "moderate",
      "headline": "Consider irrigation in the next 2-3 days",
      "rationale": "No significant rainfall expected. Flowering stage demands consistent soil moisture.",
      "forecast": [
        { "day": "Today", "tempMax": 28, "rainMm": 0, "condition": "Sunny" },
        { "day": "Tomorrow", "tempMax": 30, "rainMm": 0, "condition": "Sunny" },
        { "day": "Oct 19", "tempMax": 31, "rainMm": 0, "condition": "Clear" },
        { "day": "Oct 20", "tempMax": 32, "rainMm": 2, "condition": "Light Rain" },
        { "day": "Oct 21", "tempMax": 30, "rainMm": 0, "condition": "Clear" }
      ],
      "tip": "Check root-zone soil moisture before turning on pumps. Adjust for local conditions."
    },
    "timestamp": "2026-10-17T09:30:00.000Z"
  }
  ```

---

### D. Farmer Marketplace (Owner: Member 4)
- **Endpoint**: `GET /api/marketplace/listings`
- **Query Parameters**: `crop`, `location`, `priceMin`, `priceMax`, `sortBy`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "listings": [
        {
          "id": "list-1",
          "title": "Fresh Tomatoes - High Quality",
          "crop": "Tomato",
          "variety": "Abhinav F1",
          "quantityKg": 580,
          "pricePerQuintal": 1800,
          "grade": "A Grade",
          "location": "Jaipur, Rajasthan",
          "harvestDate": "2026-10-15",
          "farmer": {
            "name": "Ramesh Kumar",
            "verified": true,
            "memberSince": "Oct 2024"
          }
        }
      ]
    },
    "timestamp": "2026-10-17T09:30:00.000Z"
  }
  ```
