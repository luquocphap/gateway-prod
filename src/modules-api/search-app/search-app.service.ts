import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateSearchAppDto } from './dto/create-search-app.dto';
import { UpdateSearchAppDto } from './dto/update-search-app.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchAppService implements OnModuleInit {
  constructor(private prisma: PrismaService, private readonly elasticsearchService: ElasticsearchService) {}
  async onModuleInit() {
    this.initArticle();
    this.initUser();
    this.initFood();
  }

  async searchApp(text: string) {
    const result = await this.elasticsearchService.search({
      index: ["articles", "users", "foods"],
      query: {
        multi_match: {
          query: text,
          fields: ["title", "content", "email", "fullName", "name"],
          operator: "or",
          fuzziness: "AUTO",
          minimum_should_match: "60%"
        }
      }
    })
    return result;
  }

  async initArticle(){
    const articles = await this.prisma.articles.findMany();
    articles.forEach((article) => {
      this.elasticsearchService.index({
        index: "articles",
        id: String(article.id),
        document: article
      })
    })
  }

  async initUser(){
    const users = await this.prisma.users.findMany();
    users.forEach((user) => {
      this.elasticsearchService.index({
        index: "users",
        id: String(user.id),
        document: user
      })
    })
  }

  async initFood(){
    const foods = await this.prisma.foods.findMany();
    foods.forEach((food) => {
      this.elasticsearchService.index({
        index: "foods",
        id: String(food.id),
        document: food
      })
    })
  }

}
