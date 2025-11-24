# 🏎️ LapLens Telemetry Prediction API
A complete backend system for predicting telemetry, managing race sessions, and generating race summaries. This backend covers data preparation, model training, session tracking, prediction endpoints, and AI-driven race story generation.

## 🚀 Getting Started (5 Minutes)

### Windows (Fastest Setup)

Double‑click:

- `quickstart.bat`

This script:

- Creates a virtual environment
- Installs dependencies
- Prepares data
- Trains models
- Starts the API server

Open in browser:

- http://localhost:8000/docs


### Mac / Linux

**Option A – Auto Setup**

```bash
python quickstart.py
```

**Option B – Manual Setup**

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Prepare data (optional)
python prepare_data.py

# Train models
python train.py

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open API docs:

- http://localhost:8000/docs


## 📦 Project Structure (Backend Only)

```text
app/
├── api/routes.py          # All API endpoints
├── core/config.py         # Settings & environment variables
├── models/                # ML model wrappers
├── schemas/               # Pydantic schemas
├── services/              # Prediction + story generation services
├── utils/                 # Logger, helpers
data/
├── raw/                   # Raw CSV telemetry
├── processed/             # Cleaned data
├── models/                # Trained ML models
```


## 📊 Data Preparation

Place telemetry files inside:

```text
data/raw/Race1/
```

Required files:

- `df_master_features_with_weather.csv` (required)
- `raw_telemetry.csv` (optional)
- `pivot.csv` (optional)

Or generate synthetic data:

```bash
python prepare_data.py
```


## 🧠 Model Training

Train all LapLens ML models:

```bash
python train.py
```

This trains:

- Lap time regression model
- Pit stop prediction model
- Tire compound classifier
- Scaler for feature normalization

Example metrics:

- Lap Time Model → R² ≈ 0.82
- Pit Model → Accuracy ≈ 0.89
- Tire Model → Accuracy ≈ 0.78


## 🖥️ Start API Server

```bash
uvicorn app.main:app --reload
```

Server URL:

- http://localhost:8000


## 🧪 Testing the API

**Method 1 – Swagger UI**

- Open http://localhost:8000/docs

**Method 2 – Example Client**

```bash
python example_client.py
```

Demonstrates:

- Creating a session
- Making predictions
- Fetching prediction history
- Closing a session

**Method 3 – cURL**

Create session:

```bash
curl -X POST "http://localhost:8000/api/session/create?vehicle_id=1&race_name=Test"
```

Predict:

```bash
curl -X POST "http://localhost:8000/api/predict/all" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

**Method 4 – Python Requests**

```python
import requests

session = requests.post(
    "http://localhost:8000/api/session/create",
    params={"vehicle_id": 1, "race_name": "Demo Race"}
).json()

payload = { ... }

pred = requests.post(
    "http://localhost:8000/api/predict/all",
    json=payload
).json()
```


## ⚙️ API Endpoints

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| POST | /api/session/create | Create a race session |
| GET | /api/session/{id} | Get session information |
| POST | /api/session/{id}/close | Close a session |
| GET | /api/session/{id}/predictions | Fetch prediction history for a session |
| POST | /api/predict/lap-time | Predict lap time |
| POST | /api/predict/pit | Predict pit stop imminence |
| POST | /api/predict/tire | Predict tire compound |
| POST | /api/predict/all | Run all predictions at once |
| POST | /api/race/story | Generate race story from provided events/stats |
| POST | /api/race/story/auto | Auto-generate race story from session data |
| POST | /generate-story-auto | Auto-generate full narrative for a car/session |

## 🏁 Race Story Endpoints

### 1️⃣ Manual Story Generation

Generate a race story by explicitly providing race events and summary statistics in the request body.

- **Endpoint:** `POST /api/race/story`


### 2️⃣ Auto Story Generation (Session-Based)

Generate a race story automatically from stored session data with minimal input.

- **Endpoint:** `POST /api/race/story/auto`
- **Request Body:**

```json
{
  "session_id": "race_xxx",
  "vehicle_id": 1
}
```

This endpoint:

- Collects stored telemetry for the session
- Extracts statistics
- Generates the narrative
- Returns the final race story


### 3️⃣ Auto Story Generation 

`POST /generate-race-story-auto`
Automatically generates a detailed narrative/story for a specific car in a race session.
This endpoint does not require race events or summary stats in the request body; it fetches all necessary race data internally, processes it, and creates a post‑race analysis story.

- **Endpoint:** `POST /generate-race-story-auto`
- **Request Body:**

```json
{
  "session_id": "race_8732362887cc",
  "vehicle_id": 1
}
```

- **Response Example:**

```json
{
  "session_id": "race_8732362887cc",
  "vehicle_id": 1,
  "story": "Car #1 experienced a perplexing race..."
}
```

- **Use Case:**
Use this endpoint when the frontend needs to display a final race story for a given car and session without manually aggregating or passing race events and stats.


## 🧩 Example Prediction Request

```json
{
  "session_id": "race_12345",
  "vehicle_id": 1,
  "lap": 25,
  "max_speed": 340.5,
  "avg_speed": 280.0,
  "std_speed": 45.2,
  "avg_throttle": 0.75,
  "brake_front_freq": 12,
  "brake_rear_freq": 8,
  "dominant_gear": 6,
  "avg_steer_angle": 5.5,
  "avg_long_accel": 2.1,
  "avg_lat_accel": 3.2,
  "avg_rpm": 11000,
  "rolling_std_lap_time": 0.5,
  "lap_time_delta": 0.3,
  "tire_wear_high": 0.45,
  "air_temp": 25.0,
  "track_temp": 45.0,
  "humidity": 60.0,
  "pressure": 1013.25,
  "wind_speed": 5.0,
  "wind_direction": 90,
  "rain": 0
}
```


## 🧹 Troubleshooting

- **Prediction returns 404**
    - Create a session first:
        - `POST /api/session/create?vehicle_id=1`
- **"models not found"**
    - Run model training:
        - `python train.py`
- **Missing dependencies**
    - Install requirements:
        - `pip install -r requirements.txt`
- **Port already in use**
    - Start on another port:
        - `uvicorn app.main:app --port 8001`
- **Training reports “no data”**
    - Prepare data:
        - `python prepare_data.py`


## 🧑‍💻 Development \& Contribution

Run tests:

```bash
pytest -v
```

Format code:

```bash
black app/
```

Type checking:

```bash
mypy app/
```


## 📘 Additional Notes

- All session data is stored in memory
- Models are loaded from `data/models/`
- The API is stateless except for in-memory session tracking
- Race story endpoints can auto-generate narratives from stored session performance
- `example_client.py` serves as a reference for integration
- Full OpenAPI schema:
    - http://localhost:8000/openapi.json


## 🎉 You’re Ready with LapLens

LapLens backend provides:

- Session tracking
- Lap time prediction
- Pit stop prediction
- Tire compound classification
- Auto-generated race stories
- Clean, modular API architecture
- End‑to‑end pipeline from data → model → API


## 🏎️ LapLens Frontend Documentation

LapLens is a real-time race strategy platform that transforms **Toyota GR Cup telemetry data** into actionable insights using machine learning predictions. The frontend provides an intuitive dashboard for monitoring live racing data, AI‑powered predictions, and strategic decision‑making.

---

## 🚀 Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI:** Custom components + Framer Motion animations
* **State Management:** React Hooks (useState, useEffect, custom hooks)
* **Data Fetching:** Native Fetch API with custom hooks
* **Charts:** Recharts for visualizations

---

## 📦 Installation & Setup

### **Prerequisites**

* Node.js **18.17+**
* npm / yarn
* Backend API server running

### **Installation Steps**

#### 1. Clone the repository

```bash
git clone <repository-url>
cd frontend
```

#### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` in the root directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 4. Run the development server

```bash
npm run dev


### 5. Open in browser

Go to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── analysis/
├── components/
│   ├── layout/
│   ├── dashboard/
│   └── ui/
├── hooks/
├── lib/
└── types/
```

---

## 📄 Page Descriptions

### 🏠 **Landing Page** (`/`)

* Entry point to the app
* Toyota Gazoo Racing themed design
* Intro + navigation to session/vehicle selection

### 🚗 **Vehicle Selection**

* Select vehicle for analysis
* Manage/create sessions
* Vehicle‑specific setup

### 🎮 **Control Panel**

* Switch between analysis views
* Live status indicators
* Session + vehicle info

### 📊 **Overview Page**

* Central monitoring dashboard
* Live lap time predictions
* Pit stop analysis
* Tire strategy indicators
* AI confidence visualizations

### 🔢 **Prediction Metrics**

* Lap time predictions
* Pit stop recommendations
* Tire compound strategy
* Real‑time confidence metrics

### 📈 **Live Telemetry Page**

* Speed, throttle, brake, tire metrics
* Interactive charts
* Environmental telemetry

### 🤖 **AI Predictions Page**

* Extended model explanations
* Detailed forecast reasoning
* Strategy recommendations

### 🗺️ **Track Map Page**

* Circuit visualization
* Sector breakdowns
* Future: live car tracking

### 📋 **Analytics Page**

* Session statistics
* Trend analysis
* System status
* Export capabilities

### 📖 **Story Generator**

* AI‑generated race narration
* Session summary
* Professional race debriefs
* Shareable reports

---

## 🎯 Key Features

### **Real-time Data Processing**

* Telemetry streaming
* Automatic prediction refresh
* Connection monitoring

### **AI-Powered Insights**

* ML-based predictions
* Natural language reasoning
* Confidence‑based recommendations

### **Professional Racing UI**

* Toyota Gazoo Racing theme
* Framer Motion animations
* Responsive across all devices

### **Session Management**

* Multiple vehicles
* Session persistence
* Export & analysis

---

## 🔧 Custom Hooks

### `useLiveRaceData`

* Fetches + normalizes real-time telemetry
* Connection state handling
* Configurable polling

### `usePredictions`

* Manages AI predictions
* Local storage support
* Handles errors + fallback logic

### `useSession`

* Session lifecycle manager
* Wraps API communication
* Persistent state

---

## 🔄 Data Flow

1. Telemetry input from backend
2. ML model predictions
3. Frontend visualization
4. User strategy interaction
5. Narrative/story generation

---

## 🚦 Performance Optimizations

* Memoized components
* Split code with dynamic imports
* Cached responses
* Optimized image delivery

---

