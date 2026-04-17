import { Global, Module } from '@nestjs/common';
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ELASTIC_SEARCH_PASSWORD, ELASTIC_SEARCH_URL, ELASTIC_SEARCH_USERNAME } from 'src/common/constant/app.constant';
@Global()
@Module({
    imports: [ElasticsearchModule.register({
        node: ELASTIC_SEARCH_URL,
        auth: {
            username: ELASTIC_SEARCH_USERNAME as string,
            password: ELASTIC_SEARCH_PASSWORD as string
        },
        tls: {
            rejectUnauthorized: false
        }
  })],
    exports: [ElasticsearchModule]
})
export class ElasticSearchModule {}
