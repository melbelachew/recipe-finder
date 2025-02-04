import { Module } from '@nestjs/common';
import { RecipesModule } from './recipes/recipes.module';
import { ConfigModule } from '@nestjs/config';
import { ElasticsearchService } from './elasticsearch/elasticsearch/elasticsearch.service';

@Module({
  imports: [
    ConfigModule.forRoot(), // Enables .env file support
    RecipesModule
  ],
  providers:[ElasticsearchService]

})
export class AppModule {}
