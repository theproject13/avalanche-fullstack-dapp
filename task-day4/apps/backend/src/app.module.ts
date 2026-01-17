import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EventLogModule } from './event-log/event-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Mongoose connection - wajib MONGODB_URI (Mongo Atlas atau Railway plugin)
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
          throw new Error(
            'MONGODB_URI is not defined in environment variables',
          );
        }

        const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
        console.log('Connecting to MongoDB with URI:', maskedUri);

        return { uri };
      },
    }),

    // Optional Postgres + TransactionsModule
    ...(process.env.POSTGRES_ENABLE === 'true'
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
              synchronize: process.env.TYPEORM_SYNC === 'true', // jangan true di production!
            }),
          }),
          TransactionsModule,
        ]
      : []),

    // Module lain yang selalu dipake
    BlockchainModule,
    EventLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}