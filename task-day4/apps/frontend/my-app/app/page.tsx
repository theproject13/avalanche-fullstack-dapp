'use client';
import { useEffect, useMemo, useState } from 'react';
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
import { createEventLog } from '@/src/lib/api';

// Helpers
const shorten = (s?: string, left = 6, right = 4) =>
  s ? `${s.slice(0, left)}…${s.slice(-right)}` : '';

const CONTRACT_ADDRESS = SIMPLE_STORAGE_ADDRESS;

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

const getTxExplorerUrl = (chainId?: number, txHash?: string) => {
  if (!txHash) return '#';
  const base = chainId === avalancheFuji.id ? 'https://testnet.snowtrace.io' : 'https://snowtrace.io';
  return `${base}/tx/${txHash}`;
};

const getAddressExplorerUrl = (chainId?: number, address?: string) => {
  if (!address) return '#';
  const base = chainId === avalancheFuji.id ? 'https://testnet.snowtrace.io' : 'https://snowtrace.io';
  return `${base}/address/${address}`;
};

export default function Page() {
  // Wallet / network
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, error: switchError } = useSwitchChain();

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}`>();
  const [confirmedHash, setConfirmedHash] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  // Read contract
  const { data: value, isLoading: isReading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    query: { enabled: isConnected && chain?.id === avalancheFuji.id },
  });

  // Write contract
  const { writeContract, isPending: isWriting, error: writeError } = useWriteContract({
    mutation: {
      async onSuccess(hash) {
        const prev = inputValue;
        try {
          await createEventLog({
            event: 'TxSubmitted',
            payload: {
              function: 'setValue',
              args: [prev],
              chainId: chain?.id,
              address: CONTRACT_ADDRESS,
              sender: address,
            },
            txHash: hash,
          });
        } catch {}
        setTxHash(hash);
        setInputValue('');
        toast.success('Transaction submitted! Waiting for confirmation...');
      },
      async onError(error) {
        const msg = getErrorMessage(error);
        try {
          await createEventLog({
            event: 'TxFailed',
            payload: {
              function: 'setValue',
              args: [inputValue],
              chainId: chain?.id,
              address: CONTRACT_ADDRESS,
              sender: address,
              error: msg,
            },
          });
        } catch {}
        setErrorMsg(msg);
        toast.error(`Transaction failed: ${msg}`);
      },
    },
  });

  // Wait for receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  useEffect(() => {
    if (isSuccess && txHash) {
      setConfirmedHash(txHash);
      toast.success('Transaction confirmed! Value updated.');
      refetch();
    }
  }, [isSuccess, txHash, refetch]);

  useEffect(() => {
    if (switchError) toast.error(`Network switch failed: ${getErrorMessage(switchError)}`);
  }, [switchError]);

  useEffect(() => {
    if (writeError) setErrorMsg(getErrorMessage(writeError));
    else setErrorMsg(undefined);
  }, [writeError]);

  // Derived UI status
  const status: 'idle' | 'pending' | 'success' | 'error' = useMemo(() => {
    if (!mounted) return 'idle';
    if (isWriting || isConfirming) return 'pending';
    if (writeError) return 'error';
    if (isSuccess) return 'success';
    return 'idle';
  }, [mounted, isWriting, isConfirming, writeError, isSuccess]);

  const statusText = useMemo(() => {
    if (status === 'pending') return txHash ? 'Pending confirmation on-chain…' : 'Waiting for wallet signature…';
    if (status === 'success') return 'Transaction confirmed';
    if (status === 'error') return errorMsg ?? 'Transaction failed';
    return 'Ready';
  }, [status, txHash, errorMsg]);

  // Actions
  const handleSetValue = () => {
    if (!inputValue) return;
    if (chain?.id !== avalancheFuji.id) {
      switchChain({ chainId: avalancheFuji.id });
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'setValue',
        args: [BigInt(inputValue)],
      });
    } catch (e) {
      const msg = getErrorMessage(e);
      setErrorMsg(msg);
      toast.error(`Transaction failed: ${msg}`);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      {/* Header */}
      <header className="w-full border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/5">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold">Simple Storage dApp</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10" suppressHydrationWarning>
              {mounted ? (chain?.name ?? 'Disconnected') : '…'}
            </span>
            {!mounted ? (
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white/80"
              >
                Connect Wallet
              </button>
            ) : !isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                disabled={isConnecting}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-medium shadow disabled:opacity-60"
              >
                {isConnecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300" suppressHydrationWarning>
                  {shorten(address)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 grid gap-6 md:grid-cols-2">
        {/* Read Card */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-sm uppercase tracking-wide text-gray-400">On-chain Data</h2>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400">Current Value</p>
              <p className="text-4xl font-bold mt-1" suppressHydrationWarning>
                {!mounted ? '-' : isReading ? 'Loading…' : value?.toString() ?? '-'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="text-sm underline text-blue-400 hover:text-blue-300"
            >
              Refresh
            </button>
          </div>
        </section>

        {/* Write Card */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-4">
          <h2 className="text-sm uppercase tracking-wide text-gray-400">Write Transaction</h2>
          <div className="space-y-2">
            <label className="text-xs text-gray-400" htmlFor="val">New Value</label>
            <input
              id="val"
              type="number"
              placeholder="Enter new value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition"
            />
          </div>
          <button
            onClick={handleSetValue}
            disabled={status === 'pending' || !isConnected || !inputValue}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold shadow disabled:opacity-60"
          >
            {status === 'pending' ? 'Processing…' : 'Set Value'}
          </button>

          {/* Status Line */}
          <div className="text-sm">
            {status === 'idle' && (
              <p className="text-gray-400">Ready</p>
            )}
            {status === 'pending' && (
              <p className="text-amber-400">{statusText}</p>
            )}
            {status === 'success' && (
              <p className="text-emerald-400">
                {statusText}
                {confirmedHash && (
                  <>
                    {' '}
                    •{' '}
                    <a
                      href={getTxExplorerUrl(chain?.id, confirmedHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {shorten(confirmedHash, 10, 8)}
                    </a>
                  </>
                )}
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-400">{statusText}</p>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-3xl px-4 pb-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between text-xs text-gray-300">
          <span>Contract</span>
          <a
            href={getAddressExplorerUrl(chain?.id, CONTRACT_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {shorten(CONTRACT_ADDRESS)}
          </a>
        </div>
        <div className="mt-3 text-center text-[11px] text-gray-400">
          © copyright by iqbalbaharsyah · design by{' '}
          <a
            href="https://github.com/theproject13"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-300"
          >
            theproject13
          </a>
        </div>
      </footer>

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
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </main>
  );
}
