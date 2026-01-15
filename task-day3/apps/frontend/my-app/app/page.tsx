'use client';
import { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { avalancheFuji } from 'wagmi/chains';
import { SIMPLE_STORAGE_ADDRESS } from '@/src/contracts/address';
import { SIMPLE_STORAGE_ABI } from '@/src/contracts/simpleStorage';
import { Toaster, toast } from 'react-hot-toast';

// ==============================
// 🔹 HELPER
// ==============================
const shortenAddress = (address?: string) => {
  if (!address) return '';
  return `${address.slice(0, 4)}....${address.slice(-4)}`;
};

// ==============================
// 🔹 CONFIG
// ==============================
const CONTRACT_ADDRESS = SIMPLE_STORAGE_ADDRESS;

// Safe error formatter: supports various error shapes returned by wagmi/viem
function getErrorMessage(err: unknown) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  try {
    const e = err as Record<string, unknown>;
    if ('shortMessage' in e && typeof e.shortMessage === 'string') return e.shortMessage;
    if ('message' in e && typeof e.message === 'string') return e.message;
    return JSON.stringify(e);
  } catch {
    return String(err);
  }
}

export default function Page() {
  // ==============================
  // 🔹 WALLET
  // ==============================
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, error: switchError } = useSwitchChain();

  // Prevent hydration mismatch: render a stable placeholder on first render
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  // ==============================
  // 🔹 LOCAL STATE
  // ==============================
  const [inputValue, setInputValue] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}`>();

  // ==============================
  // 🔹 READ CONTRACT
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    query: {
      enabled: isConnected && chain?.id === avalancheFuji.id,
    },
  });

  // ==============================
  // 🔹 WRITE CONTRACT
  // ==============================
  const { writeContract, isPending: isWriting, error: writeError } = useWriteContract({
    mutation: {
      onSuccess(hash) {
        setTxHash(hash);
        setInputValue('');
        toast.success('Transaction submitted! Waiting for confirmation...');
      },
      onError(error) {
        toast.error(`Transaction failed: ${getErrorMessage(error)}`);
      },
    },
  });

  const handleSetValue = () => {
    if (!inputValue) return;

    if (chain?.id !== avalancheFuji.id) {
      switchChain({ chainId: avalancheFuji.id });
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValue',
      args: [BigInt(inputValue)],
    });
  };

  // ==============================
  // 🔹 TX CONFIRMATION
  // ==============================
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction confirmed! Value updated.');
      refetch();
    }
  }, [isSuccess, refetch]);

  // Handle switch chain error
  useEffect(() => {
    if (switchError) {
      toast.error(`Network switch failed: ${getErrorMessage(switchError)}`);
    }
  }, [switchError]);

  // Handle write error (extra safety)
  useEffect(() => {
    if (writeError) {
      toast.error(`Error: ${getErrorMessage(writeError)}`);
    }
  }, [writeError]);

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8">
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Day 3 – Frontend dApp (Avalanche Fuji)
          </h1>

          {/* ==========================
              WALLET CARD – ukuran tetap & seimbang
          ========================== */}
          <div className="h-48 flex flex-col items-center justify-center bg-white/5 rounded-xl border border-white/10 p-6">
            {/* Show a stable server-safe placeholder until client hydration completes */}
            {!mounted ? (
              <button
                disabled
                className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-70"
              >
                Connect Wallet
              </button>
            ) : !isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                disabled={isConnecting}
                className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition transform hover:scale-105 disabled:opacity-70"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="w-full space-y-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Connected Address</p>
                  <p className="font-mono text-lg break-all">{shortenAddress(address)}</p>
                </div>
                <p className="text-sm text-gray-400">
                  Network: <span className="font-medium">{chain?.name ?? 'Unknown'}</span>
                </p>
                <button
                  onClick={() => disconnect()}
                  className="w-full max-w-xs py-3 bg-red-600 hover:bg-red-700 font-medium rounded-xl shadow transition transform hover:scale-105"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* ==========================
              READ CONTRACT
          ========================== */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Current Contract Value</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold">
                {isReading ? 'Loading...' : value?.toString() ?? '-'}
              </p>
              <button
                onClick={() => refetch()}
                className="text-sm underline text-blue-400 hover:text-blue-300"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* ==========================
              WRITE CONTRACT
          ========================== */}
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Update Contract Value</p>
            <input
              type="number"
              placeholder="Enter new value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            />
            <button
              onClick={handleSetValue}
              disabled={isWriting || isConfirming}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold rounded-xl shadow-lg transition transform hover:scale-105 disabled:opacity-70"
            >
              {isWriting
                ? 'Waiting for wallet...'
                : isConfirming
                ? 'Confirming transaction...'
                : 'Set Value'}
            </button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Smart contract = single source of truth
          </p>
        </div>
      </div>

      {/* Toast container */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1f1f1f',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid #333',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </main>
  );
}