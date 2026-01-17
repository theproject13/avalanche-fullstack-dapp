import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EventLogModule } from './event-log/event-log.module';

const POSTGRES_ENABLE = process.env.POSTGRES_ENABLE === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(POSTGRES_ENABLE
      ? [
          TypeOrmModule.forRootAsync({
            useFactory: () => ({
              type: 'postgres',
              host: process.env.POSTGRES_HOST || 'localhost',
              port: Number(process.env.POSTGRES_PORT || 5432),
              username: process.env.POSTGRES_USER || 'postgres',
              password: process.env.POSTGRES_PASSWORD || 'postgres',
              database: process.env.POSTGRES_DB || 'appdb',
              autoLoadEntities: true,
              synchronize: process.env.TYPEORM_SYNC === 'true',
            }),
          }),
          TransactionsModule,
        ]
      : []),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.MONGODB_URI ||
          `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'appdb'}`,
      }),
    }),
    BlockchainModule,
    EventLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}