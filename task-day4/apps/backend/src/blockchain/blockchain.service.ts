import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { createPublicClient, 
        http, 
        fallback, 
        PublicClient, 
        decodeEventLog } from 'viem';
import type { Abi } from 'viem';
import { avalancheFuji } from 'viem/chains';
import SIMPLE_STORAGE from './simple-storage.json';

const MAX_BLOCK_RANGE = 2048;

// Helper: Recursive convert semua BigInt ke string biar JSON.stringify aman
function serializeBigInts(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInts);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.entries(obj).map(([key, value]) => [key, serializeBigInts(value)]),
    );
  }
  return obj;
}

@Injectable()
export class BlockchainService {
  private readonly client: PublicClient;
  private readonly contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: fallback([
        http('https://avalanche-fuji-c-chain-rpc.publicnode.com'),     
        http('https://avalanche-fuji.drpc.org'),                       
        http('https://endpoints.omniatech.io/v1/avax/fuji/public'),   
        // http('https://api.avax-test.network/ext/bc/C/rpc'),         
      ]),
    });

    // Address hasil deploy Day-2
    this.contractAddress = '0x89dacfc1f72876218a2d4eae30a525097aff3721';
  }

  // cast the JSON ABI to viem's Abi type safely
  private readonly contractAbi: Abi = SIMPLE_STORAGE.abi as unknown as Abi;

  // =========================
  // Task 2 – Read Smart Contract (Latest + Historical)
  // =========================
  async getLatestValue() {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: this.contractAbi,
        functionName: 'getValue',
      });

      const valueStr =
        typeof result === 'bigint' ? result.toString() : String(result);

      return {
        success: true,
        data: {
          value: valueStr,
        },
      };
    } catch {
      this.handleRpcError(new Error('Failed to read contract value'));
    }
  }

  // Historical value at specific block
  async getValueAtBlock(blockNumber: number) {
    if (blockNumber < 0) {
      throw new BadRequestException('blockNumber must be >= 0');
    }

    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        abi: this.contractAbi,
        functionName: 'getValue',
        blockNumber: BigInt(blockNumber),
      });

      const valueStr =
        typeof result === 'bigint' ? result.toString() : String(result);

      return {
        success: true,
        data: {
          blockNumber,
          value: valueStr,
        },
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // =========================
  // Task 3 – Event Query + Pagination
  // =========================
  async getValueUpdatedEvents(
    fromBlock: number,
    toBlock: number,
    offset = 0,
    limit = 10,
    raw = false,
  ) {
    if (toBlock < fromBlock) {
      throw new BadRequestException('toBlock harus >= fromBlock');
    }

    if (toBlock - fromBlock > MAX_BLOCK_RANGE) {
      throw new BadRequestException(
        `Block range maksimal ${MAX_BLOCK_RANGE} blocks`,
      );
    }

    try {
      const logs = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: 'event',
          name: 'ValueUpdated',
          inputs: [{ name: 'newValue', type: 'uint256', indexed: false }],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      const paginated = logs.slice(offset, offset + limit);

      const mapped = paginated.map((log) => {
        const newValue = log.args?.newValue;

        const topicsArr =
          Array.isArray(log.topics) && log.topics.length > 0
            ? (log.topics as [`0x${string}`, ...`0x${string}`[]])
            : ([] as []);

        let decoded: unknown = null;
        try {
          decoded = decodeEventLog({
            abi: this.contractAbi,
            data: typeof log.data === 'string' ? log.data : '0x',
            topics: topicsArr,
          });
        } catch {
          decoded = null;
        }

        const item = {
          blockNumber: log.blockNumber ? Number(log.blockNumber) : null,
          logIndex: log.logIndex !== undefined ? Number(log.logIndex) : null,
          value: typeof newValue === 'bigint' ? newValue.toString() : null,
          txHash: log.transactionHash ?? null,
          decoded,
          ...(raw ? { raw: log } : {}),
        } as const;

        return item;
      });

      // Serialize seluruh response biar BigInt aman
      return {
        success: true,
        data: mapped.map(serializeBigInts),
        meta: {
          total: logs.length,
          offset,
          limit,
        },
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // Fetch raw log per block + index
  async getLogByBlockAndIndex(blockNumber: number, index: number) {
    if (blockNumber < 0) {
      throw new BadRequestException('block must be >= 0');
    }

    if (index < 0) {
      throw new BadRequestException('index must be >= 0');
    }

    try {
      const logs = await this.client.getLogs({
        fromBlock: BigInt(blockNumber),
        toBlock: BigInt(blockNumber),
      });

      const log = logs[index];

      if (!log) {
        return {
          success: true,
          data: null,
          message: `No log at index ${index} for block ${blockNumber}`,
        };
      }

      let decoded: unknown = null;
      try {
        const dataHex = typeof log.data === 'string' ? log.data : '0x';
        const topicsArr =
          Array.isArray(log.topics) && log.topics.length > 0
            ? (log.topics as [`0x${string}`, ...`0x${string}`[]])
            : ([] as []);
        decoded = decodeEventLog({
          abi: this.contractAbi,
          data: dataHex,
          topics: topicsArr,
        });
      } catch {
        // ignore decode errors
      }

      // Serialize seluruh data response
      const responseData = serializeBigInts({
        blockNumber: log.blockNumber ? Number(log.blockNumber) : null,
        logIndex: log.logIndex !== undefined ? Number(log.logIndex) : null,
        transactionHash: log.transactionHash,
        address: log.address,
        topics: log.topics,
        data: log.data,
        decoded,
        raw: log,
      });

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // Method baru: Ambil current block number (untuk dynamic range di events-sample)
  async getCurrentBlockNumber(): Promise<number> {
    try {
      const blockNumber = await this.client.getBlockNumber();
      return Number(blockNumber);
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // Centralized RPC Error Handler
  private handleRpcError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);

    console.error('[Blockchain RPC Error]', message);

    if (message.includes('timeout')) {
      throw new ServiceUnavailableException(
        'RPC timeout. Silakan coba beberapa saat lagi.',
      );
    }

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed')
    ) {
      throw new ServiceUnavailableException(
        'Tidak dapat terhubung ke blockchain RPC.',
      );
    }

    throw new InternalServerErrorException(
      'Terjadi kesalahan saat membaca data blockchain.',
    );
  }
}