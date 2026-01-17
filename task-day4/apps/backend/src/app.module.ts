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
// const NODE_ENV = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    // ===== ENV CONFIG =====
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ===== POSTGRES (OPTIONAL) =====
    ...(POSTGRES_ENABLE
      ? [
          TypeOrmModule.forRootAsync({
            useFactory: () => ({
              type: 'postgres',
              host: process.env.POSTGRES_HOST,
              port: Number(process.env.POSTGRES_PORT),
              username: process.env.POSTGRES_USER,
              password: process.env.POSTGRES_PASSWORD,
              database: process.env.POSTGRES_DB,
              autoLoadEntities: true,
              synchronize: process.env.TYPEORM_SYNC === 'true',
            }),
          }),
          TransactionsModule,
        ]
      : []),

    // ===== MONGODB (REQUIRED) =====

    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
          throw new Error(
            'MONGODB_URI is not required! : ${{mongodb.MONGODB_URI}}',
          );
        }

        // Log buat debug (mask password biar aman)
        const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
        console.log('Connecting to MongoDB with URI:', maskedUri);

        return { uri };
      },
    }),

    // ===== APP MODULES =====
    BlockchainModule,
    EventLogModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
