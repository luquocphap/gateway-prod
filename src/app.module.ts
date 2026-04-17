import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules-api/auth/auth.module';
import { PrismaModule } from './modules-system/prisma/prisma.module';
import { TokenModule } from './modules-system/token/token.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ProtectGuard } from './common/guards/protect.guard';
import { RoleGuard } from './common/guards/role.guard';
import { ArticleModule } from './modules-api/article/article.module';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ResponseSuccessInterceptor } from './common/interceptor/response-success.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { REDIS_URL } from './common/constant/app.constant';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ElasticSearchModule } from './modules-system/elastic-search/elastic-search.module';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ppid } from 'process';
import { SearchAppModule } from './modules-api/search-app/search-app.module';
import { TotpModule } from './modules-api/totp/totp.module';
import { OrderModule } from './modules-api/order/order.module';
import { RabbitMqModule } from './modules-system/rabbitmq/rabbitmq.module';
@Module({
  imports: [AuthModule, PrismaModule, TokenModule, ArticleModule,
     CacheModule.register({
       isGlobal: true, stores: [new KeyvRedis(REDIS_URL)] 
      }), 
      ElasticSearchModule, SearchAppModule, TotpModule, OrderModule, RabbitMqModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ProtectGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSuccessInterceptor
    }
  ],
})
export class AppModule {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache,
   private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    try {
      await this.cacheManager.get('healthcheck');
      console.log('✅ [REDIS] Kết nối redis thành công');
    } catch (error){
      console.log({ error });
    }

    try {
      const result = await this.elasticsearchService.ping();
      console.log("✅ [ELASTIC SEARCH] kết nối thành công", {result})
    } catch (error){
      console.log({ elasticSearch: error})
    }
  }
} 
