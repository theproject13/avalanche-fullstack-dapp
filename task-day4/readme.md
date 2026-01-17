# Avalanche Full Stack dApp (Monorepo)

Concise guide for integrating and deploying a full stack Web3 dApp using **Avalanche**, covering **Smart Contracts (Hardhat)**, **Backend (NestJS)**, and **Frontend (Next.js with wagmi & viem)**.

---

## Repository Structure
```
apps/
├─ backend/          # NestJS API (MongoDB, viem, Swagger)
│  ├─ src/
│  └─ package.json
├─ contracts/        # Hardhat (Solidity contracts & deployment scripts)
│  ├─ contracts/
│  ├─ scripts/
│  ├─ hardhat.config.ts
│  └─ package.json
└─ frontend/
   └─ my-app/        # Next.js App Router (wagmi + viem)
      ├─ app/
      ├─ src/
      └─ package.json

assets/
.env.example
README.md
```

---

## Prerequisites
- Node.js LTS
- Git
- MongoDB (Atlas or local)
- Wallet with AVAX Fuji testnet balance

---

## Local Setup

### 1) Install Dependencies
**Backend**
```bash
cd apps/backend
npm install
```

**Frontend**
```bash
cd apps/frontend/my-app
npm install
```

**Contracts**
```bash
cd apps/contracts
npm install
```

---

### 2) Environment Variables

**Backend — `apps/backend/.env`**
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
CORS_ORIGIN=http://localhost:3000
CONTRACT_ADDRESS=0x<deployed_contract_on_fuji>
POSTGRES_ENABLE=false
```

**Frontend — `apps/frontend/my-app/.env.local`**
```
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<deployed_contract_on_fuji>
```

**Contracts — `apps/contracts/.env` (optional)**
```
# RPC URL / PRIVATE_KEY for deployment
# NEVER commit private keys
```

---

### 3) Run Locally

**Backend**
```bash
cd apps/backend
npm run start:dev
```
Runs on `http://localhost:3001`

Available endpoints:
- `GET /blockchain/value`
- `GET /blockchain/value-at/:block`
- `GET /blockchain/events`
- `GET /blockchain/log`
- `GET /blockchain/events-sample`
- `POST /event-logs`
- `GET /event-logs`
- Swagger: `/documentation`

**Frontend**
```bash
cd apps/frontend/my-app
npm run dev
```
Access via `http://localhost:3000`

**Contracts**
```bash
cd apps/contracts
npx hardhat compile
npx hardhat run scripts/deployment.ts --network fuji
```
Copy deployed contract address to frontend & backend env.

---

## Integration Flow
- **Read:** Frontend → Backend API → Blockchain (via viem)
- **Write (Tx):** Frontend → Wallet → Blockchain  
  (Backend is **not** involved in sending transactions)

---

## Deployment

### Backend (Railway)
1. Ensure scripts:
   - `build`: `nest build`
   - `start:prod`: `node dist/main`
2. Railway listens on `process.env.PORT`
3. Set Railway variables:
```
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://<frontend>.vercel.app[,https://<preview>.vercel.app]
CONTRACT_ADDRESS=0x...
```
4. Deploy via GitHub integration
5. Verify:
   - `/documentation`
   - `/blockchain/*`
   - `/event-logs`

---

### Frontend (Vercel)
1. Set environment variables:
```
NEXT_PUBLIC_API_BASE=https://<backend>.up.railway.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```
2. Deploy
3. Verify via browser DevTools:
   - Network calls return `200/201`
   - Requests target Railway backend

---

### Contracts
- Deploy via Hardhat to Fuji/Mainnet
- Update deployed address in frontend & backend env

---

## Day 5 — Tasks & Checklist

**Required**
- Frontend consumes backend API (no direct RPC)
- Wallet-based transaction flow
- Environment separation (local vs production)

**Optional**
- Production deployment (Railway + Vercel)
- UI/UX polish (loading, error states)

**Final Checklist**
- Contract deployed
- Backend live
- Frontend live
- Wallet connect works
- Read & write verified end-to-end

---

## Troubleshooting

**CORS error**
- Ensure `CORS_ORIGIN` matches exact Vercel domain
- Redeploy backend

**Wrong API URL**
- Check `NEXT_PUBLIC_API_BASE`
- Redeploy frontend (env baked at build time)

**Test via Git Bash**
```bash
curl -X POST "https://<backend>.up.railway.app/event-logs"   -H "Content-Type: application/json"   -d '{"event":"from-vercel","payload":{"t":123}}'

curl -X GET "https://<backend>.up.railway.app/event-logs"
```

---

© iqbalbaharsyah — Avalanche Short Course Day 1–5
