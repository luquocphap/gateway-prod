import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { buildQueryPrisma } from 'src/common/helper/build-query-prisma.helper';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}
  create(createArticleDto: CreateArticleDto) {
    return 'This action adds a new article';
  }

  async findAll(req) {
    // const value = await this.cacheManager.get('key');
    // if (value){
    //   return value
    // }

    const { index, page, pageSize, where } = buildQueryPrisma(req);

    const resultPrismaPromise = this.prisma.articles.findMany({
      where: where,
      skip: index, // skip tương đương với OFFSET
      take: pageSize, // take tương đương với LIMIT
      include: {
        Users: true,
      },
    });
    const totalItemPromise = this.prisma.articles.count({
      // ở findMany mà where cái gì thì đưa vào count giống như vậy
      where: where,
    });

    const [resultPrisma, totalItem] = await Promise.all([
      resultPrismaPromise,
      totalItemPromise,
    ]);

    const totalPage = Math.ceil(totalItem / pageSize);

    const result = {
      totalItem: totalItem,
      totalPage: totalPage,
      page: page,
      pageSize: pageSize,
      items: resultPrisma,
    }
    
    // await this.cacheManager.set('article', result);
    // console.dir(this.cacheManager.stores, {colors: true, depth: null});

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
