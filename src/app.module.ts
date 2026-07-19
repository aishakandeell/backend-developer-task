import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembersModule } from './modules/members/members.module';
import { ProductsModule } from './modules/products/products.module';
import { ShopsModule } from './modules/shops/shops.module';
import { JoiPipeModule } from 'nestjs-joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // In-memory response cache, available app-wide. Individual routes opt in
    // with CacheInterceptor; the default TTL below applies unless a route
    // overrides it with @CacheTTL.
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60 seconds (milliseconds)
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        uri: config.get<string>('DATABASE_URL'),
        sync: { alter: true },
        autoLoadModels: true,
        logging: false,
      }),
    }),
    JoiPipeModule.forRoot({
      pipeOpts: {
        defaultValidationOptions: {
          abortEarly: false,
          allowUnknown: false,
        },
      },
    }),
    MembersModule,
    ProductsModule,
    ShopsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
