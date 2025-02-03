import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch/elasticsearch.service';

@Injectable()
export class RecipesService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async addRecipe(recipe: any) {
    return this.elasticsearchService.indexRecipe(recipe);
  }

  async searchRecipes(query: string) {
    return this.elasticsearchService.searchRecipe(query);
  }
}