import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch/elasticsearch.service';
import { ConfigModule } from '@nestjs/config';

@Module({ imports: [    ConfigModule.forRoot()
], controllers: [RecipesController], providers: [RecipesService, ElasticsearchService],
})
export class RecipesModule {}
