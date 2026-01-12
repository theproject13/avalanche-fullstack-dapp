const connectBtn = document.getElementById("connectBtn");
const switchBtn = document.getElementById("switchBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const errorEl = document.getElementById("error");

const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

let isConnected = false;
let hasInitiatedConnect = false; // ← Flag baru: hanya setelah user klik connect
let currentAddress = null;

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  return (balance / 1e18).toFixed(4);
}

function shortenAddress(addr) {
  if (!addr) return "-";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function clearError() {
  errorEl.textContent = "\u00A0";
}

function setConnectingState(connecting) {
  connectBtn.disabled = connecting;
  connectBtn.textContent = connecting ? "Connecting..." : (isConnected ? "Disconnect Wallet" : "Connect Wallet");
}

async function getBalance(address) {
  try {
    const balanceWei = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    balanceEl.textContent = formatAvaxBalance(balanceWei);
  } catch (err) {
    console.error("getBalance error:", err);
    errorEl.textContent = "Failed to fetch balance";
    balanceEl.textContent = "-";
  }
}

async function switchToFuji() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AVALANCHE_FUJI_CHAIN_ID }],
    });
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      errorEl.textContent = "Fuji Testnet not added to wallet";
    } else {
      errorEl.textContent = "Failed to switch network";
    }
    console.error(switchError);
  }
}

async function checkAndHandleNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      switchBtn.style.display = "none";
      if (isConnected && currentAddress) {
        statusEl.textContent = "Connected ✅";
        statusEl.style.color = "#4cd137";
        await getBalance(currentAddress);
      }
    } else {
      networkEl.textContent = "Wrong Network ❌";
      statusEl.textContent = "Please switch to Fuji Testnet";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
      switchBtn.style.display = "block";
      await switchToFuji();
    }
  } catch (err) {
    console.error(err);
  }
}

async function connectWallet() {
  if (isConnected) {
    // Disconnect manual
    isConnected = false;
    hasInitiatedConnect = false;
    currentAddress = null;
    statusEl.textContent = "Not Connected";
    statusEl.style.color = "";
    addressEl.textContent = "-";
    addressEl.title = "";
    networkEl.textContent = "-";
    balanceEl.textContent = "-";
    switchBtn.style.display = "none";
    clearError();
    setConnectingState(false);
    return;
  }

  if (typeof window.ethereum === "undefined") {
    errorEl.textContent = "Core Wallet not detected";
    alert("Core Wallet not detected. Please install Core Wallet extension.");
    return;
  }

  setConnectingState(true);
  statusEl.textContent = "Requesting connection...";
  clearError();

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) throw new Error("No accounts authorized");

    currentAddress = accounts[0];
    isConnected = true;
    hasInitiatedConnect = true; // ← Aktifkan flag setelah user klik

    addressEl.textContent = shortenAddress(currentAddress);
    addressEl.title = currentAddress;

    setConnectingState(false);
    await checkAndHandleNetwork();
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Connection Failed";
    statusEl.style.color = "#e84118";
    errorEl.textContent = error.message || "Connection rejected";
    setConnectingState(false);
  }
}

function handleAccountsChanged(accounts) {
  clearError();

  if (!accounts || accounts.length === 0) {
    // Selalu tangani disconnect (dari wallet)
    isConnected = false;
    hasInitiatedConnect = false;
    currentAddress = null;
    statusEl.textContent = "Not Connected";
    statusEl.style.color = "";
    addressEl.textContent = "-";
    addressEl.title = "";
    balanceEl.textContent = "-";
    networkEl.textContent = "-";
    switchBtn.style.display = "none";
    setConnectingState(false);
    return;
  }

  // Hanya update kalau user sudah pernah manual connect di session ini
  if (hasInitiatedConnect) {
    currentAddress = accounts[0];
    isConnected = true;
    addressEl.textContent = shortenAddress(currentAddress);
    addressEl.title = currentAddress;
    setConnectingState(false);
    checkAndHandleNetwork();
  }
  // Kalau belum initiated → ignore (tidak auto-connect UI)
}

function handleChainChanged() {
  clearError();
  if (hasInitiatedConnect) {
    checkAndHandleNetwork();
  }
}

function setupListeners() {
  if (window.ethereum && window.ethereum.on) {
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
  }
}

setupListeners();

connectBtn.addEventListener("click", connectWallet);
switchBtn.addEventListener("click", switchToFuji);