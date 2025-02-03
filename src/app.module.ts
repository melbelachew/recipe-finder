import { Module } from '@nestjs/common';
import { RecipesModule } from './recipes/recipes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Enables .env file support
    RecipesModule
  ],

})
export class AppModule {}
