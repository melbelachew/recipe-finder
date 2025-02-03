import { Client } from '@elastic/elasticsearch';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
    private readonly client:Client
    constructor(private readonly configService: ConfigService){
        this.client = new Client({
            node: this.configService.get<string>('ELASTICSEARCH_URL') || 'http://localhost:9201',
   
              headers: {
                'x-elastic-product': 'Elasticsearch', // **Forces compatibility mode**
              },
        })
    }
    async onModuleInit() {
        try {
            const health = await this.client.cluster.health();
            console.log('✅ Elasticsearch connected:', health);
          } catch (error) {
            console.error('❌ Elasticsearch connection error:', error);
          }      }

    async createIndex(){
        const indexExists = await this.client.indices.exists({index: 'recipes'})
        if(!indexExists){
            await this.client.indices.create({
                index: 'recipes',
                body: {
                    mappings: {
                        properties: {
                            title: { type: 'text' },
                            ingredients: { type: 'text' },
                            cuisine: { type: 'keyword' },
                        }
                    }

                }
            })
            console.log('✅ Created Elasticsearch index: recipes');

        }
    }
    async indexRecipe(recipe: any) {
        return this.client.index({
          index: 'recipes',
          body: recipe,
        });
      }

    async searchRecipe(query: string){
        const result = await this.client.search({
            index: 'recipes',
            body: {
                
                    query: {
                        multi_match:{
                            query,
                            fields:['title', 'ingredients', 'cuisine']
                        }
                    }
                
            }
        })
        return result.hits.hits.map((hit:any)=>hit._source)
    }
    
}
