import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { GetEventsDto } from './dto/get-events.dto';
import { ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger'; // tambah ApiOperation & ApiResponse

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly service: BlockchainService) {}

  @Get('value')
  getLatestValue() {
    return this.service.getLatestValue();
  }

  // Historical value endpoint – dengan @ApiParam multi-line rapi
  @Get('value-at/:block')
  @ApiParam({
    name: 'block',
    example: 50489513,
    description: 'Block number untuk baca historical value',
  })
  getValueAtBlock(@Param('block', ParseIntPipe) block: number) {
    return this.service.getValueAtBlock(block);
  }

  @Get('events')
  getEvents(@Query() query: GetEventsDto) {
    return this.service.getValueUpdatedEvents(
      query.fromBlock,
      query.toBlock,
      query.offset ?? 0,
      query.limit ?? 10,
      query.raw ?? false,
    );
  }

  @Get('log')
  getLogByIndex(@Query('block') block: number, @Query('index') index: number) {
    return this.service.getLogByBlockAndIndex(Number(block), Number(index));
  }

  // Endpoint baru: Demo recent events dengan range otomatis
  @Get('events-sample')
  @ApiOperation({
    summary: 'Ambil ValueUpdated events terbaru (demo 500 block terakhir)',
    description:
      'Endpoint ini secara otomatis ambil current block number, lalu query events dari 500 block terakhir.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Recent events berhasil di-fetch (bisa kosong kalau belum ada transaksi baru)',
  })
  @ApiResponse({
    status: 503,
    description: 'RPC error (timeout atau koneksi gagal)',
  })
  async getSampleEvents(): Promise<{
    success: boolean;
    data: any[];
    meta: {
      total: number;
      offset: number;
      limit: number;
    };
  }> {
    const currentBlock = await this.service.getCurrentBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 500); // range aman < MAX_BLOCK_RANGE
    const toBlock = currentBlock;

    return this.service.getValueUpdatedEvents(fromBlock, toBlock, 0, 50, false);
  }}