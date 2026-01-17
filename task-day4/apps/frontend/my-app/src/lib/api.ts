export const apiBase = 
  process.env.NEXT_PUBLIC_API_BASE;
  
  // console.log('API BASE:', apiBase);

export async function getEventLogs() {
  const res = await fetch(`${apiBase}/event-logs`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch event logs: ${res.status}`);
  return res.json();
}

export async function createEventLog(input: {
  event: string;
  payload?: Record<string, unknown>;
  txHash?: string;
  blockNumber?: number;
}) {
  const res = await fetch(`${apiBase}/event-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create event log: ${res.status}`);
  return res.json();
}

export async function getTransactions() {
  const res = await fetch(`${apiBase}/transactions`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
  return res.json();
}

export async function createTransaction(input: {
  txHash: string;
  from?: string | null;
  to?: string | null;
  value?: string | null;
  blockNumber?: number | null;
}) {
  const res = await fetch(`${apiBase}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create transaction: ${res.status}`);
  return res.json();
}
