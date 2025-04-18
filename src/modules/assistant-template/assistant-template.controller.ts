import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { LimitQuery } from '@/common/dto/limit-query.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { AssistantTemplateService } from './assistant-template.service';

@Controller('assistant-template')
export class AssistantTemplateController extends BaseController {
  constructor(private readonly assistantTemplateService: AssistantTemplateService) {
    super();
  }

  @Get()
  async findAll() {
    try {
      const templates = await this.assistantTemplateService.findAll();
      return { templates };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  @Get('paginated')
  async findAllPaginated(@Query() query: PaginateQuery) {
    try {
      const { templates, meta } = await this.assistantTemplateService.findAllPaginated({
        page: query.page,
        limit: query.limit,
        searchQuery: query.searchQuery,
      });
      return { templates, meta };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  @Get('random')
  async findRandom(@Query() query: LimitQuery) {
    try {
      const templates = await this.assistantTemplateService.findRandom({
        limit: query.limit,
      });
      return { templates };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  @Get('/one/:id')
  async findOne(@Param() param: IdParam) {
    const templateId = param.id;
    try {
      const template = await this.assistantTemplateService.findOne(templateId);
      return { template };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  // Categories
  @Get('category')
  async findAllCategories() {
    try {
      const categories = await this.assistantTemplateService.findAllCategories();
      return { categories };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  @Get('category/paginated')
  async findAllCategoriesPaginated(@Query() query: PaginateQuery) {
    try {
      const [categories, meta] = await this.assistantTemplateService.findAllCategoriesPaginated({
        page: query.page,
        limit: query.limit,
        searchQuery: query.searchQuery,
      });
      return { categories, meta };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  @Get('category/:id/templates')
  async findOneCategory(@Param() param: IdParam) {
    const categoryId = param.id;
    try {
      const templates = await this.assistantTemplateService.findTemplatesByCategory(categoryId);
      return { templates };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }

  @Post('categories/templates')
  @HttpCode(HttpStatus.OK)
  async findTemplatesByCategories(@Body('categoryIds') categoryIds: string[]) {
    try {
      const categories =
        await this.assistantTemplateService.findTemplatesByCategoryIds(categoryIds);
      return { categories };
      //
    } catch (e: unknown) {
      this.handleError(e);
    }
  }
}
