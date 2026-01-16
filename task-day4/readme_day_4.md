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
- Digunakan untuk activity log UI

Best practice:
- Jangan fetch dari block `0` di production
- Gunakan pagination / block range

Endpoint:

```http
GET /blockchain/events
```

Response:

```json
[
  {
    "blockNumber": "123450",
    "value": "40",
    "txHash": "0xabc..."
  }
]
```

---

## 🛡️ 2.7 Error Handling & RPC Failure

Scenario yang ditangani:

- RPC timeout
- Network error
- Unknown RPC failure

### Contoh Error Response

**RPC Timeout**

```json
{
  "statusCode": 503,
  "message": "RPC timeout. Silakan coba beberapa saat lagi.",
  "error": "Service Unavailable"
}
```

**Network Error**

```json
{
  "statusCode": 503,
  "message": "Tidak dapat terhubung ke blockchain RPC.",
  "error": "Service Unavailable"
}
```

**Unknown Error**

```json
{
  "statusCode": 500,
  "message": "Terjadi kesalahan saat membaca data blockchain.",
  "error": "Internal Server Error"
}
```

---

## 📝 Homework – Day 4 (40 Menit)

### 🟢 Task 1 – Setup Blockchain Module (Wajib)
- Buat module `blockchain`
- Setup viem public client
- Konfigurasi Avalanche Fuji RPC

### 🟢 Task 2 – Read Smart Contract (Wajib)
- Endpoint `getValue()`
- Return JSON response

### 🟢 Task 3 – Event Query (Wajib)
- Endpoint event `ValueUpdated`
- Return `blockNumber` & `value`

### 🟡 Task 4 – API Design (Opsional)
- Pagination sederhana
- Response format konsisten
- Error handling rapi

### 🔵 Task 5 – Integration Test (Opsional)
- Test via browser / Postman
- Validasi response API

---

## 🧪 Checklist Submission

- [ ] Backend NestJS berjalan
- [ ] viem terhubung ke Fuji RPC
- [ ] API bisa read contract
- [ ] Event bisa di-fetch
- [ ] Frontend bisa consume API

📅 **Deadline**: 17 Januari 2026 – 23.59 WIB

---

## ✅ Output Day 4

Peserta:
- Memiliki backend API Web3 aktif
- Bisa membaca data blockchain via REST API
- Memahami:
  - Backend Web3 ≠ Backend Web2
  - On-chain vs off-chain responsibility
  - Peran backend dalam UX dApp
  - viem sebagai bridge ke blockchain

Siap lanjut ke **Day 5 – Production & Scaling dApp** 🚀

