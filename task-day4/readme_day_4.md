# Project dApps – Day 4 (Backend Web3)

Day 4 berfokus pada **Backend Web3 Architecture**: membaca data blockchain secara efisien, event indexing, dan penyediaan REST API untuk frontend dApp. Backend bertindak sebagai *read-only blockchain gateway* guna meningkatkan UX, reliability, dan scalability.

---

## 🎯 Fokus Day 4

- Event listening (ValueUpdated)
- Indexing & data query blockchain
- UX & state management lanjutan (via backend)
- Best practice production dApp (RPC handling, error handling)

---

## 🚀 2.1 Setup Backend Project

Masuk ke direktori backend:

```bash
cd dapps/backend
```

Install NestJS CLI:

```bash
npm i -g @nestjs/cli
```

Generate project NestJS:

```bash
nest new backend
cd backend
```

Jalankan server development:

```bash
npm run start:dev
```

Akses API:

```text
http://localhost:3000
```

---

## 📁 2.2 Struktur Backend

```text
dapps/backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   └── blockchain/
│       ├── blockchain.module.ts
│       ├── blockchain.service.ts
│       ├── blockchain.controller.ts
│       └── simple-storage.abi.ts
```

---

## 🔗 2.3 Setup viem Public Client

Install library viem:

```bash
npm install viem
```

Backend akan:
- Terhubung ke Avalanche Fuji RPC
- Menggunakan **public client** (tanpa wallet & private key)
- Melakukan read-only blockchain query

---

## 📜 2.4 Load Smart Contract

Backend menggunakan data dari **Day 2 (Smart Contract)**:

- Contract address (hasil deploy)
- ABI JSON (`simple-storage.abi.ts`)

Fungsi backend:
- Load ABI
- Konfigurasi contract
- Menyediakan read-only call ke blockchain

---

## 🔍 2.5 API – Read Contract State

Endpoint:

```http
GET /blockchain/value
```

Contoh response:

```json
{
  "value": 42,
  "blockNumber": 123456,
  "updatedAt": "2026-01-10T08:00:00Z"
}
```

📌 Frontend **tidak perlu** memanggil blockchain secara langsung.

---

## 📊 2.6 API – Fetch Event History

Fungsi:
- Fetch event `ValueUpdated`
- Menggunakan block range
# Day 4 — Backend Web3 (Avalanche Fullstack DApp)

This document explains how to run and verify the Day 4 backend (NestJS + viem).

## Summary
- Backend app: `apps/backend`
- Connects to Avalanche Fuji RPC using `viem` (public client)
- Endpoints implemented:
  - `GET /blockchain/value` — read contract value
  - `GET /blockchain/events` — fetch `ValueUpdated` events (supports pagination + raw)
  - `GET /blockchain/log` — inspect raw log by block & index

## Prerequisites
- Node.js >= 18
- npm

## Install & run
```bash
cd apps/backend
npm install
npm run start:dev
```

Swagger UI: http://localhost:3000/documentation

## Example requests
- Read value:
```bash
curl http://localhost:3000/blockchain/value
```

- Query events (decoded + raw):
```bash
curl "http://localhost:3000/blockchain/events?fromBlock=50489513&toBlock=50489513&offset=0&limit=10&raw=true"
```

- Inspect raw log by block/index:
```bash
curl "http://localhost:3000/blockchain/log?block=50511054&index=70"
```

## Developer checks
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`

## Notes
- Ensure `contractAddress` in `apps/backend/src/blockchain/blockchain.service.ts` matches your deployed contract on Fuji.
- `decoded` field will be present if the log matches the contract ABI; otherwise the backend returns raw hex fields.
- `offset` is 0-based and applies to filtered events.

## Submission
- Provide server URL (or instructions to run locally) and example curl commands (above).

If you want, I can add a short automated e2e test or update README with example responses.
```


