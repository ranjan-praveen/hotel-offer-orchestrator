# 🏨 Hotel Offer Orchestrator

A TypeScript/Node.js service that aggregates hotel offers from two mock suppliers, compares overlapping hotels, selects the cheapest offer for each hotel, stores the results in Redis, and supports price-range filtering.

The workflow is orchestrated using **Temporal.io**.

---

## ✨ Features

- 🔄 Fetch hotel offers from two suppliers in parallel
- ⚡ Temporal workflow orchestration
- 🏨 Deduplicate hotels by name
- 💰 Select the cheapest offer for each hotel
- 🔎 Filter hotels by price range
- 🗄️ Store deduplicated results in Redis
- 📊 Perform price filtering using Redis sorted sets
- ❤️ Supplier health monitoring
- 🐳 Docker Compose infrastructure
- 🧪 Postman API collection
- 📝 Logging and error handling

---

## 🛠️ Tech Stack

- **Node.js**
- **TypeScript**
- **Express**
- **Temporal.io**
- **Redis**
- **PostgreSQL**
- **Docker / Docker Compose**
- **Axios**
- **ioredis**

---

## 📋 Prerequisites

Make sure the following are installed:

- Node.js 20+
- npm
- Docker Desktop

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
npm install
```

---

## 📜 Available Scripts

```text
npm run dev           Start the API in development mode
npm run worker        Start the Temporal worker
npm run build         Compile TypeScript
npm run start         Start the compiled API
npm run start:worker  Start the compiled Temporal worker
npm run infra:up      Start Docker infrastructure
npm run infra:down    Stop Docker infrastructure
```

---

# 🚀 Start the Application

## 1. Start Infrastructure

### Windows

You can start the Docker infrastructure using the PowerShell script:

```powershell
.\scripts\start.ps1
```

Alternatively:

```powershell
npm run infra:up
```

This starts:

- ⏱️ Temporal
- 🐘 PostgreSQL
- 🔴 Redis
- 🖥️ Temporal UI

Check the containers:

```powershell
docker compose ps
```

The `temporal-admin-tools` container may show `Exited (0)` after initialization. This is expected.

---

## 2. Start the Temporal Worker

Open a new terminal:

```powershell
npm run worker
```

You should see:

```text
Temporal worker started
Worker state changed ... RUNNING
```

Keep this terminal running.

### ⏱️ Temporal Namespace

The application uses the Temporal `default` namespace.

The namespace is created automatically during infrastructure setup by the Temporal initialization script, so no manual namespace creation is required.

You can verify it with:

```powershell
docker run --rm --network hotel-offer-orchestrator_default `
  temporalio/admin-tools:1.31.0 `
  temporal operator namespace list `
  --address hotel-temporal:7233
```

---

## 3. Start the API

Open another terminal:

```powershell
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

# 🔌 API Endpoints

## ❤️ Health Check

Checks the health of both mock suppliers.

```text
GET /health
```

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:3000/health"
```

Expected response:

```json
{
  "status": "healthy",
  "suppliers": {
    "supplierA": "healthy",
    "supplierB": "healthy"
  }
}
```

If either supplier is unavailable, the overall status becomes:

```json
{
  "status": "degraded"
}
```

---

## 🏨 Get Hotel Offers

```text
GET /api/hotels?city=delhi
```

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:3000/api/hotels?city=delhi"
```

The workflow:

1. Calls Supplier A and Supplier B in parallel.
2. Combines their hotel offers.
3. Deduplicates hotels by name.
4. Selects the cheapest offer for each hotel.
5. Saves the result in Redis.
6. Returns the final list.

---

## 💰 Filter Hotels by Price

```text
GET /api/hotels?city=delhi&minPrice=5500&maxPrice=7000
```

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:3000/api/hotels?city=delhi&minPrice=5500&maxPrice=7000"
```

Example result:

```text
Radison   5900
Marriot   7000
```

Price filtering is performed using Redis.

---

## 🔎 City With No Results

```text
GET /api/hotels?city=mumbai
```

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:3000/api/hotels?city=mumbai"
```

Expected response:

```json
[]
```

---

# 🔄 Workflow

The overall request flow is:

```text
                    ┌─────────────────┐
                    │     Client      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Express API   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Temporal Client │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Workflow     │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
          ┌───────────────┐     ┌───────────────┐
          │  Supplier A   │     │  Supplier B   │
          └───────┬───────┘     └───────┬───────┘
                  │                     │
                  └──────────┬──────────┘
                             ▼
                    ┌─────────────────┐
                    │ Combine Offers  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Deduplicate by  │
                    │      Name       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Keep Cheapest   │
                    │     Offer       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      Redis      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Price Filtering │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   API Response  │
                    └─────────────────┘
```

---

# 🗄️ Redis

Deduplicated hotel results are stored using:

```text
hotels:<city>
```

Example:

```powershell
docker exec hotel-redis redis-cli GET "hotels:delhi"
```

Price filtering uses a Redis sorted-set index.

Example:

```powershell
docker exec hotel-redis redis-cli ZRANGEBYSCORE hotels:delhi 5500 7000
```

Expected hotel IDs:

```text
a2
b4
```

---

# 🧪 Postman

A Postman collection is included in the repository:

```text
hotel-offer-orchestrator.postman_collection.json
```

The collection includes:

- ❤️ Health Check
- 🏨 Delhi hotel search
- 💰 Delhi hotel search with price range
- 🔎 City with no results

Set the Postman environment variable:

```text
baseUrl = http://localhost:3000
```

---

# 🐳 Docker

Start the infrastructure:

```powershell
npm run infra:up
```

Check running containers:

```powershell
docker compose ps
```

Stop the infrastructure:

```powershell
npm run infra:down
```

---

# 🏗️ Build

Compile the TypeScript application:

```powershell
npm run build
```

Start the compiled API:

```powershell
npm run start
```

In another terminal, start the compiled worker:

```powershell
npm run start:worker
```

---

# 🩺 Health & Error Handling

The application includes:

- API health endpoint
- Supplier health checks
- Temporal activity error handling
- API error handling
- Logging for workflow/activity failures

The `/health` endpoint reports the health of both suppliers.

---

# 📁 Project Structure

```text
hotel-offer-orchestrator/
│
├── src/
│   ├── activities/
│   │   ├── supplierActivities.ts
│   │   └── redisActivities.ts
│   │
│   ├── workflows/
│   │   └── offerWorkflow.ts
│   │
│   ├── client.ts
│   ├── server.ts
│   └── worker.ts
│
├── scripts/
│   └── start.ps1
│
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
└── hotel-offer-orchestrator.postman_collection.json
```

---

# 📊 Example

For:

```text
GET /api/hotels?city=delhi
```

The service returns the cheapest offer for each hotel.

Example:

```text
Holtin    5340
Radison   5900
Taj       7500
Marriot   7000
```

For:

```text
GET /api/hotels?city=delhi&minPrice=5500&maxPrice=7000
```

The filtered result is:

```text
Radison   5900
Marriot   7000
```

---

## 🎯 Done

The application can be started locally using Docker Compose, a Temporal worker, and the Node.js API.
