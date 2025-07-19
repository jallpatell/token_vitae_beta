# 📊 Historical Token Price Oracle — Interpolation Engine

A full-stack dApp that allows querying accurate historical token prices (on Ethereum or Polygon) at a specific timestamp — even if exact price data is missing — using interpolation and caching for performance.

This system is built using **Next.js**, **Node.js/Express**, **MongoDB**, **Redis**, **BullMQ**, and **Alchemy SDK**, and includes background workers for fetching entire price history from a token's creation date.

---
## 🚀 Demo

📺 [Watch the Demo on YouTube](#)  
🌐 [Live App (Vercel)](https://yourfrontend.vercel.app) – for testing  
📦 [API Docs](https://yourbackend.com/docs)

---

## 📑 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [License](#license)

---

## ✨ Features

- 🔍 **Historical Token Price Lookup**
  - Provide token address, network ("ethereum" or "polygon"), and a timestamp.
  - Returns exact or interpolated price.

- 📈 **Full Historical Price Scheduler**
  - Schedule a background fetch from token creation to today.

- 🧠 **Interpolation Engine**
  - Calculates interpolated price when exact market data is unavailable.

- 🔁 **Caching (Redis)**
  - Low latency for repeated queries with automatic TTL.

- 🗃️ **Persistent Storage (MongoDB)**
  - Stores token price data for future analytics and charting.

- 🛠️ **Queue Workers (BullMQ)**
  - Robust, restart-safe job queue for scheduled historical fetches.

---
ARCH
---


## 🛠 Technologies Used

| Layer        | Tech                         |
|--------------|------------------------------|
| Frontend     | Next.js, React, Tailwind CSS |
| State Mgmt   | Zustand                      |
| Backend      | Node.js, Express.js          |
| Queue        | BullMQ + Redis               |
| Database     | MongoDB (Mongoose)           |
| Cache        | Redis                        |
| Web3         | Alchemy SDK                  |
| Misc         | dotenv, cors, axios, etc.    |

---

## 🔧 Getting Started

### 🧱 Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm
- MongoDB (local or Atlas)
- Redis (local or Redis Cloud)
- Alchemy API Key

---

### ⚙️ 1. Clone the Repository

<pre>
  git clone https://github.com/your_username/token-price-oracle.git
  cd token-price-oracle  
</pre>


---

### 📦 2. Install Dependencies

<pre>
  npm init -y
  npm install 
</pre>




---

### 🔐 3. Environment Variables

#### 📁 Backend `.env`

<pre>

PORT=3001
API_KEY=my_super_secret_key

MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/tokenoracle?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379

ALCHEMY_API_KEY_ETHEREUM=your_eth_key
ALCHEMY_API_KEY_POLYGON=your_polygon_key

</pre>

> 🔐 Do not commit your `.env` file to Git!

#### 📁 Frontend `.env.local`
<pre>
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=my_super_secret_key
</pre>
text

---

### 🖥️ 4. Run the App Locally

#### 🔙 Backend (API + Queue Worker)

<pre>
cd backend
npm start # or: nodemon index.js

</pre>


#### 🔁 Start price history job worker
node src/workers/bullmq.js



#### 🎨 Frontend (Next.js)

<pre>
cd frontend
npm run dev

</pre>



---

## 🔌 API Endpoints

### 📥 `POST /price`

Returns the price of a token at a given timestamp.

Request:
<pre>
{
"token": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
"network": "ethereum", // or polygon
"timestamp": 1678901234
}

Response:
{
"price": 0.9997,
"source": "alchemy" | "interpolated" | "cache" | "db"
}

</pre>

---

### 📥 `POST /schedule`

Schedules a full historical fetch from token creation to now.

Request:

<pre>
{
"token": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
"network": "polygon"
}

Response:
{
"status": "scheduled"
}

</pre>

---

## ✅ Test Cases

### 1. Exact Match Price

<pre>
  
curl -X POST http://localhost:3001/price
-H "Content-Type: application/json"
-H "x-api-key: your_api_key"
-d '{
"token": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
"network": "ethereum",
"timestamp": 1678901234
}'

</pre>

### 2. Interpolation Needed

<pre>
curl -X POST http://localhost:3001/price
-H "Content-Type: application/json"
-H "x-api-key: your_api_key"
-d '{
"token": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
"network": "polygon",
"timestamp": 1679032800
}'

</pre>

---

## 🤝 Contributing

Pull requests are welcome! For major changes:
- Please open an issue first
- Explain what you want to add or improve.

---

## 🙋‍♂️ Questions?

- Raise an issue here on GitHub

---
