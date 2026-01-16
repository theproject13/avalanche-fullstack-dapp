import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';

@Module({
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    // IndexerService, // ← tambahin kalau indexer udah ada
  ],
})
export class BlockchainModule {}