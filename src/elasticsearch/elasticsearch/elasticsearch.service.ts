import { Client } from '@elastic/elasticsearch';
import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Injectable()
export class ElasticsearchService implements OnModuleInit {
    private readonly client: Client;

    constructor(private readonly configService: ConfigService) {
        this.client = new Client({
            node: this.configService.get<string>('ELASTICSEARCH_URL') || 'http://localhost:9201',
            headers: {
                'x-elastic-product': 'Elasticsearch', // **Forces compatibility mode**
            }
        });
        this.initElasticsearch().catch(console.error);
    }

    async onModuleInit() {
        this.initElasticsearch();
    }

    private async initElasticsearch() {
        try {
            console.log('🚀 Initializing Elasticsearch...');
            await this.createIndex();
            console.log('✅ Elasticsearch connection and index setup complete.');
        } catch (error) {
            console.error('❌ Elasticsearch connection error:', error);
        }
    }

    private async createIndex() {
        console.log('🔍 Checking if the recipes index exists...');

        const indexExists = await this.client.indices.exists({ index: "recipes" });

        if (!indexExists) { 
            console.log('⚡ Creating the recipes index...');

            await this.client.indices.create({
                index: 'recipes',
                body: {
                    mappings: {
                        properties: {
                            title: { type: 'text' },
                            ingredients: { type: 'text' },
                            cuisine: { type: 'keyword' },
                            title_suggest: { type: "completion" } 
                        }
                    }
                }
            });
            console.log('✅ Created Elasticsearch index: recipes');
        } else {
            console.log('✅ Elasticsearch index already exists.');
        }
    }

    async indexRecipe(recipe: any) {
        return this.client.index({
            index: 'recipes',
            body: {
                ...recipe,
                title_suggest: { input: [recipe.title] },
            },
        });
    }

    async searchRecipe(query: string, cuisine?: string, ingredients?: string) {
        const mustQuery: any[] = [];

        if (query) {
            mustQuery.push({
                multi_match: {
                    query,
                    fields: ['title^5', 'ingredients^2', 'cuisine'],
                    fuzziness: 'AUTO'
                }
            });
        }

        if (cuisine) {
            mustQuery.push({
                term: { cuisine: cuisine.toLowerCase() },
            });
        }

        if (ingredients) {
            mustQuery.push({
                match: { ingredients: ingredients.toLowerCase() }
            });
        }

        const result = await this.client.search({
            index: 'recipes',
            body: {
                query: {
                    bool: {
                        must: mustQuery
                    }
                }
            }
        });
        return result.hits.hits.map((hit: any) => hit._source);
    }

    async autoCompleteRecipes(prefix: string) {
        try {
            console.log(`🔍 Running autocomplete for prefix: "${prefix}"`);
    
            const result = await this.client.search({
                index: "recipes",
                body: {
                    suggest: {
                        title_suggest: {
                            prefix: prefix.toLowerCase(),
                            completion: {
                                field: "title_suggest",
                                size: 5
                            }
                        }
                    }
                }
            });
    
            console.log("✅ Elasticsearch Response:", JSON.stringify(result, null, 2));
    
            const suggestions = result.suggest?.title_suggest?.[0]?.options || [];
    
            return Array.isArray(suggestions) ? suggestions.map((opt) => opt.text) : [];
    
        } catch (error) {
            console.error("❌ Elasticsearch Autocomplete Error:", error);
            throw new Error(`Autocomplete search failed: ${error.message}`);
        }
    }
    
}
