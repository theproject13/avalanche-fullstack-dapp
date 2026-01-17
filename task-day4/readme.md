# Avalanche Full Stack dApp (Monorepo)

Concise guide for integrating and deploying the full stack dApp across Contracts (Hardhat), Backend (NestJS), and Frontend (Next.js, wagmi, viem).

---

## Repository Structure
```
apps/
  backend/        # NestJS API (MongoDB, viem, Swagger)
    src/
    package.json
  contracts/      # Hardhat (Solidity contracts & deployment)
    contracts/
    scripts/
    hardhat.config.ts
    package.json
  frontend/
    my-app/       # Next.js (App Router, wagmi + viem)
      app/
      src/
      package.json
assets/
.env.example
readme.md
```

---

## Prerequisites
- Node.js LTS, Git
- MongoDB (Atlas or local) connection string
- Wallet for Avalanche Fuji testnet (for transactions)

---

## Step-by-Step Setup (Local)

1) Install dependencies per workspace
- Backend (NestJS)
```sh
cd apps/backend
npm install
```
- Frontend (Next.js)
```sh
cd apps/frontend/my-app
npm install
```
- Contracts (Hardhat)
```sh
cd apps/contracts
npm install
```

2) Configure environment variables
- Backend (.env in apps/backend)
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
CORS_ORIGIN=http://localhost:3000
CONTRACT_ADDRESS=0x<deployed_contract_on_fuji>
POSTGRES_ENABLE=false
```
- Frontend (.env.local in apps/frontend/my-app)
```
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<deployed_contract_on_fuji>
```
- Contracts (.env optional in apps/contracts)
```
# RPC/keys if needed for deploy; NEVER commit private keys
```

3) Run locally
- Backend (NestJS)
```sh
cd apps/backend
npm run start:dev   # listens on PORT or 3001
```
Endpoints:
- GET /blockchain/value
- GET /blockchain/value-at/:block
- GET /blockchain/events
- GET /blockchain/log
- GET /blockchain/events-sample
- POST /event-logs, GET /event-logs
- Swagger: /documentation

- Frontend (Next.js)
```sh
cd apps/frontend/my-app
npm run dev         # http://localhost:3000
```
Ensure NEXT_PUBLIC_API_BASE points to backend (http://localhost:3001).

- Contracts (Hardhat)
```sh
cd apps/contracts
npx hardhat compile
# Example deploy to Fuji (adjust script/network config)
npx hardhat run scripts/deployment.ts --network fuji
```
Copy the deployed address to:
- NEXT_PUBLIC_CONTRACT_ADDRESS (frontend)
- CONTRACT_ADDRESS (backend, if used for reads)

---

## Integration Flow
- Read: Frontend → Backend API → Blockchain (via viem on backend)
- Write (tx): Frontend → Wallet → Blockchain (backend is not in tx path)

---

## Deployment

Backend (Railway)
1) Ensure scripts in apps/backend/package.json support build/start:
   - build: `nest build`
   - start:prod: `node dist/main`
2) Railway uses `process.env.PORT` (already handled in code)
3) Set variables (Railway → Variables):
```
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://<frontend>.vercel.app[,https://<preview>.vercel.app]
CONTRACT_ADDRESS=0x...
```
4) Deploy via GitHub repo integration and verify:
   - https://<project>.up.railway.app/documentation
   - /event-logs, /blockchain/* endpoints

Frontend (Vercel)
1) Set env (Project → Settings → Environment Variables):
```
NEXT_PUBLIC_API_BASE=https://<backend>.up.railway.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```
2) Deploy and verify via DevTools Network that calls to /event-logs and /blockchain/* return 200/201.

Contracts
- Deploy to Fuji/Mainnet using Hardhat; update addresses in FE/BE envs.

---

## Day 5 — Concise Tasks & Checklist
1) Integrate Frontend & Backend (Required)
- Frontend consumes backend API (no direct RPC). Display blockchain data.

2) Integrate Transactions (Required)
- User updates on-chain state via wallet; UI refreshes via backend reads.

3) Environment Config (Required)
- Separate local/prod via .env; avoid hardcoding.

4) Deployment (Optional)
- Backend on Railway; Frontend on Vercel; use Fuji testnet.

5) Final Polish (Optional)
- Loading states, error handling, UI improvements.

Final checklist
- Contract deployed (address/ABI saved)
- Backend live and reachable
- Frontend live and calling backend
- Wallet connect works
- Read & write verified end-to-end

Quiz Day 5: add your link here.

---

## Troubleshooting (CORS & ENV)
- CORS blocked in browser:
  - Set CORS_ORIGIN on Railway to exact Vercel origin(s) and redeploy.
- Frontend still calls wrong URL:
  - Ensure NEXT_PUBLIC_API_BASE is correct; redeploy Vercel (env is baked at build).
- Validate from Git Bash:
```sh
curl -X POST "https://<backend>.up.railway.app/event-logs" \
  -H "Content-Type: application/json" \
  -d '{"event":"from-vercel","payload":{"t":123}}'

curl -X GET "https://<backend>.up.railway.app/event-logs"
```

---

© Avalanche Indonesia Short Course — Day 5