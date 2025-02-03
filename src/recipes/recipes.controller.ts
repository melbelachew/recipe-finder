import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesServices: RecipesService){}

    @Post()
    async addRecipe(@Body() recipe:any){
        return this.recipesServices.addRecipe(recipe)
    }
    @Get("search")
    async search(@Query('q')query :string){
        return this.recipesServices.searchRecipes(query)
    }
}

