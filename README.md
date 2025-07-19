# 🧠 Historical Token Price Oracle — Interpolation Engine

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


