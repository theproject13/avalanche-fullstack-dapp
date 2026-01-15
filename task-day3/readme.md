\# 2️⃣ Demo (1 Jam)



\## 2.1 Setup Frontend Project



```bash

cd apps/frontend

npm install

npx create-next-app@latest

# npm run dev = skip

```
cd my-app

1. npm install wagmi viem @tanstack/react-query

2. npm install @walletconnect/ethereum-provider


Akses:



```text

http://localhost:3000

```



---



\## 2.2 Setup Reown Provider



Langkah umum:



\- Buat WalletConnect Project ID

\- Setup Reown provider

\- Aktifkan Avalanche Fuji

\- Bungkus Next.js app dengan provider



📌 Detail teknis dijelaskan saat demo live.



```bash



npm install wagmi viem @tanstack/react-query

npm install @walletconnect/ethereum-provider

```

avalanche-fullstack-dapp/
├── apps/
│   ├── frontend/     # Next.js dApp
│   ├── backend/      # NestJS API
│   └── contracts/    # Solidity & Hardhat
│
├── docs/             # Modul pembelajaran Day 1–Day 5
├── docker/           # Optional docker setup
├── .env.example
└── README.md



create file provider.tsx



```bash

'use client';



import { WagmiProvider, createConfig, http } from 'wagmi';

import { avalancheFuji } from 'wagmi/chains';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



const queryClient = new QueryClient();



const config = createConfig({

&nbsp; chains: \[avalancheFuji],

&nbsp; transports: {

&nbsp;   \[avalancheFuji.id]: http(),

&nbsp; },

});



export function Providers({ children }: { children: React.ReactNode }) {

&nbsp; return (

&nbsp;   <WagmiProvider config={config}>

&nbsp;     <QueryClientProvider client={queryClient}>

&nbsp;       {children}

&nbsp;     </QueryClientProvider>

&nbsp;   </WagmiProvider>

&nbsp; );

}

```





edit layout.tsx



```bash

import './globals.css';

import { Providers } from './providers';



export default function RootLayout({

&nbsp; children,

}: {

&nbsp; children: React.ReactNode;

}) {

&nbsp; return (

&nbsp;   <html lang="en">

&nbsp;     <body>

&nbsp;       <Providers>{children}</Providers>

&nbsp;     </body>

&nbsp;   </html>

&nbsp; );

}

```







---



\## 2.3 Connect Wallet (Core Wallet)



Demo mencakup:



\- Tombol \*\*Connect Wallet\*\*

\- Connect via Core Wallet

\- Ambil wallet address

\- Deteksi network (Fuji)



edit page.tsx on app folder



``` bash

'use client';



import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { injected } from 'wagmi/connectors';



export default function Home() {

&nbsp; const { address, isConnected } = useAccount();

&nbsp; const { connect, isPending } = useConnect();

&nbsp; const { disconnect } = useDisconnect();



&nbsp; return (

&nbsp;   <main className="min-h-screen flex items-center justify-center">

&nbsp;     <div className="p-6 border rounded space-y-4">

&nbsp;       <h1 className="text-xl font-bold">Step 1: Connect Wallet</h1>



&nbsp;       {!isConnected ? (

&nbsp;         <button

&nbsp;           onClick={() => connect({ connector: injected() })}

&nbsp;           disabled={isPending}

&nbsp;           className="px-4 py-2 bg-black text-white rounded"

&nbsp;         >

&nbsp;           {isPending ? 'Connecting...' : 'Connect Wallet'}

&nbsp;         </button>

&nbsp;       ) : (

&nbsp;         <div className="space-y-2">

&nbsp;           <p className="text-sm">Connected address:</p>

&nbsp;           <p className="font-mono text-xs break-all">{address}</p>



&nbsp;           <button

&nbsp;             onClick={() => disconnect()}

&nbsp;             className="text-sm underline text-red-600"

&nbsp;           >

&nbsp;             Disconnect

&nbsp;           </button>

&nbsp;         </div>

&nbsp;       )}

&nbsp;     </div>

&nbsp;   </main>

&nbsp; );

}



```



---



\## 2.4 Load Smart Contract



Data dari Day 2:



\- Contract address

\- ABI JSON



Frontend akan:



\- Load ABI

\- Membuat contract instance

\- Siap melakukan read \& write



📌 Library EVM: \*\*ethers.js / viem\*\*



---



\## 2.5 Read Contract (Call)



Demo:



\- Panggil `getValue()`

\- Tampilkan value ke UI

\- Tidak memicu wallet popup



---



\## 2.6 Write Contract (Transaction)



Demo:



\- Input value

\- Panggil `setValue(uint256)`

\- Wallet popup muncul

\- Handle:



&nbsp; - Loading

&nbsp; - Success

&nbsp; - Error / revert



---



\## 2.7 Transaction UX Feedback



Ditampilkan:



\- Transaction hash

\- Status pending

\- Status confirmed

\- Error message jika gagal



---



\# 3️⃣ Praktik / Homework (1 Jam)



\## 🎯 Objective



Peserta mampu \*\*menghubungkan frontend Next.js ke smart contract secara mandiri\*\*.



---



\## 3.1 Task 1 – Wallet Connection



Implementasikan:



\- Connect wallet dengan Reown

\- Tampilkan wallet address

\- Tampilkan network status



---



\## 3.2 Task 2 – Read Contract



\- Load ABI \& address

\- Panggil `getValue()`

\- Tampilkan hasil ke UI



---



\## 3.3 Task 3 – Write Contract



\- Input value

\- Call `setValue`

\- Handle loading \& error



---

update final page.tsx

```bash

'use client';



import { useState } from 'react';

import {

&nbsp; useAccount,

&nbsp; useConnect,

&nbsp; useDisconnect,

&nbsp; useReadContract,

&nbsp; useWriteContract,

} from 'wagmi';

import { injected } from 'wagmi/connectors';

import { parseEther } from 'ethers';



// ==============================

// 🔹 CONFIG

// ==============================



// 👉 GANTI dengan contract address hasil deploy kamu day 2

const CONTRACT\_ADDRESS = 'address kmu';



// 👉 ABI SIMPLE STORAGE

const SIMPLE\_STORAGE\_ABI = \[

&nbsp; {

&nbsp;   inputs: \[],

&nbsp;   name: 'getValue',

&nbsp;   outputs: \[{ type: 'uint256' }],

&nbsp;   stateMutability: 'view',

&nbsp;   type: 'function',

&nbsp; },

&nbsp; {

&nbsp;   inputs: \[{ name: '\_value', type: 'uint256' }],

&nbsp;   name: 'setValue',

&nbsp;   outputs: \[],

&nbsp;   stateMutability: 'nonpayable',

&nbsp;   type: 'function',

&nbsp; },

];



export default function Page() {

&nbsp; // ==============================

&nbsp; // 🔹 WALLET STATE

&nbsp; // ==============================

&nbsp; const { address, isConnected } = useAccount();

&nbsp; const { connect, isPending: isConnecting } = useConnect();

&nbsp; const { disconnect } = useDisconnect();



&nbsp; // ==============================

&nbsp; // 🔹 LOCAL STATE

&nbsp; // ==============================

&nbsp; const \[inputValue, setInputValue] = useState('');



&nbsp; // ==============================

&nbsp; // 🔹 READ CONTRACT

&nbsp; // ==============================

&nbsp; const {

&nbsp;   data: value,

&nbsp;   isLoading: isReading,

&nbsp;   refetch,

&nbsp; } = useReadContract({

&nbsp;   address: CONTRACT\_ADDRESS,

&nbsp;   abi: SIMPLE\_STORAGE\_ABI,

&nbsp;   functionName: 'getValue',

&nbsp; });



&nbsp; // ==============================

&nbsp; // 🔹 WRITE CONTRACT

&nbsp; // ==============================

&nbsp; const {

&nbsp;   writeContract,

&nbsp;   isPending: isWriting,

&nbsp; } = useWriteContract();



&nbsp; const handleSetValue = async () => {

&nbsp;   if (!inputValue) return;



&nbsp;   writeContract({

&nbsp;     address: CONTRACT\_ADDRESS,

&nbsp;     abi: SIMPLE\_STORAGE\_ABI,

&nbsp;     functionName: 'setValue',

&nbsp;     args: \[BigInt(inputValue)],

&nbsp;   });

&nbsp; };



&nbsp; // ==============================

&nbsp; // 🔹 UI

&nbsp; // ==============================

&nbsp; return (

&nbsp;   <main className="min-h-screen flex items-center justify-center bg-black text-white">

&nbsp;     <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 space-y-6">



&nbsp;       <h1 className="text-xl font-bold">

&nbsp;         Day 3 – Frontend dApp (Avalanche)

&nbsp;       </h1>



&nbsp;       {/\* ==========================

&nbsp;           WALLET CONNECT

&nbsp;       ========================== \*/}

&nbsp;       {!isConnected ? (

&nbsp;         <button

&nbsp;           onClick={() => connect({ connector: injected() })}

&nbsp;           disabled={isConnecting}

&nbsp;           className="w-full bg-white text-black py-2 rounded"

&nbsp;         >

&nbsp;           {isConnecting ? 'Connecting...' : 'Connect Wallet'}

&nbsp;         </button>

&nbsp;       ) : (

&nbsp;         <div className="space-y-2">

&nbsp;           <p className="text-sm text-gray-400">Connected Address</p>

&nbsp;           <p className="font-mono text-xs break-all">{address}</p>



&nbsp;           <button

&nbsp;             onClick={() => disconnect()}

&nbsp;             className="text-red-400 text-sm underline"

&nbsp;           >

&nbsp;             Disconnect

&nbsp;           </button>

&nbsp;         </div>

&nbsp;       )}



&nbsp;       {/\* ==========================

&nbsp;           READ CONTRACT

&nbsp;       ========================== \*/}

&nbsp;       <div className="border-t border-gray-700 pt-4 space-y-2">

&nbsp;         <p className="text-sm text-gray-400">Contract Value (read)</p>



&nbsp;         {isReading ? (

&nbsp;           <p>Loading...</p>

&nbsp;         ) : (

&nbsp;           <p className="text-2xl font-bold">{value?.toString()}</p>

&nbsp;         )}



&nbsp;         <button

&nbsp;           onClick={() => refetch()}

&nbsp;           className="text-sm underline text-gray-300"

&nbsp;         >

&nbsp;           Refresh value

&nbsp;         </button>

&nbsp;       </div>



&nbsp;       {/\* ==========================

&nbsp;           WRITE CONTRACT

&nbsp;       ========================== \*/}

&nbsp;       <div className="border-t border-gray-700 pt-4 space-y-3">

&nbsp;         <p className="text-sm text-gray-400">Update Contract Value</p>



&nbsp;         <input

&nbsp;           type="number"

&nbsp;           placeholder="New value"

&nbsp;           value={inputValue}

&nbsp;           onChange={(e) => setInputValue(e.target.value)}

&nbsp;           className="w-full p-2 rounded bg-black border border-gray-600"

&nbsp;         />



&nbsp;         <button

&nbsp;           onClick={handleSetValue}

&nbsp;           disabled={isWriting}

&nbsp;           className="w-full bg-blue-600 py-2 rounded"

&nbsp;         >

&nbsp;           {isWriting ? 'Updating...' : 'Set Value'}

&nbsp;         </button>

&nbsp;       </div>



&nbsp;       {/\* ==========================

&nbsp;           FOOTNOTE

&nbsp;       ========================== \*/}

&nbsp;       <p className="text-xs text-gray-500 pt-2">

&nbsp;         Smart contract = single source of truth

&nbsp;       </p>



&nbsp;     </div>

&nbsp;   </main>

&nbsp; );

}



```



\## 3.4 Task 4 – UX Improvement (Opsional)



\- Disable button saat tx pending

\- Shorten wallet address

\- Toast / alert status transaksi

\- Refresh value setelah tx success



---



\## 3.5 Task 5 – Failure Handling (Opsional)



Handle kasus:



\- User reject transaction

\- Wrong network

\- Transaction revert



---



\## 🧪 Checklist



\- \[ ] Next.js app berjalan

\- \[ ] Wallet bisa connect

\- \[ ] Network Fuji terdeteksi

\- \[ ] Read contract berhasil

\- \[ ] Write contract berhasil

\- \[ ] Tx muncul di explorer



\[Submission Link](https://forms.gle/ma5m2n8eG3eDnCjX6) aktif selama 48 jam



---



\## ✅ Output Day 3



Pada akhir Day 3:



\- Frontend Next.js terhubung ke wallet

\- Smart contract bisa di-read \& write

\- Peserta memahami:



&nbsp; - Frontend Web3 ≠ Web2

&nbsp; - Wallet \& transaction flow

&nbsp; - UX transaksi blockchain

&nbsp; - Contract sebagai source of truth



---

