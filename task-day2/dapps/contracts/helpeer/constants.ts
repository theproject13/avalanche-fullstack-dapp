import dotenv from 'dotenv';

dotenv.config();

export const USER_PRIVATE_KEY = process.env.PRIVATE_KEY || "";
export const RPC_URL = process.env.RPC_URL || "";
export const ETHERSCAN_API = process.env.ETHERSCAN_API || "";