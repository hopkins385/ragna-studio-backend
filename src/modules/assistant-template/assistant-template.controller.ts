import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AssistantTemplateService } from './assistant-template.service';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { LimitQuery } from '@/common/dto/limit-query.dto';

@Controller('assistant-template')
export class AssistantTemplateController {
  private readonly logger = new Logger(AssistantTemplateController.name);

  constructor(
    private readonly assistantTemplateService: AssistantTemplateService,
  ) {}

  @Get()
  async findAll() {
    try {
      const templates = await this.assistantTemplateService.findAll();
      return { templates };
      //
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(`Error fetching assistant templates: ${e.message}`);
      } else {
        this.logger.error(`Error fetching assistant templates`);
      }
      throw new NotFoundException();
    }
  }

  @Get('paginated')
  async findAllPaginated(@Query() query: PaginateQuery) {
    try {
      const { templates, meta } =
        await this.assistantTemplateService.findAllPaginated({
          page: query.page,
          limit: query.limit,
          searchQuery: query.searchQuery,
        });
      return { templates, meta };
      //
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(`Error fetching assistant templates: ${e.message}`);
      } else {
        this.logger.error(`Error fetching assistant templates`);
      }
      throw new NotFoundException();
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
      if (e instanceof Error) {
        this.logger.error(
          `Error fetching random assistant template: ${e.message}`,
        );
      } else {
        this.logger.error(`Error fetching random assistant template`);
      }
      throw new NotFoundException();
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
      if (e instanceof Error) {
        this.logger.error(`Error fetching assistant template: ${e.message}`);
      } else {
        this.logger.error(`Error fetching assistant template`);
      }
      throw new NotFoundException();
    }
  }

  // Categories
  @Get('category')
  async findAllCategories() {
    try {
      const categories =
        await this.assistantTemplateService.findAllCategories();
      return { categories };
      //
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(
          `Error fetching assistant template categories: ${e.message}`,
        );
      } else {
        this.logger.error(`Error fetching assistant template categories`);
      }
      throw new NotFoundException();
    }
  }

  @Get('category/paginated')
  async findAllCategoriesPaginated(@Query() query: PaginateQuery) {
    try {
      const [categories, meta] =
        await this.assistantTemplateService.findAllCategoriesPaginated({
          page: query.page,
          limit: query.limit,
          searchQuery: query.searchQuery,
        });
      return { categories, meta };
      //
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(
          `Error fetching assistant template categories: ${e.message}`,
        );
      } else {
        this.logger.error(`Error fetching assistant template categories`);
      }
      throw new NotFoundException();
    }
  }

  @Get('category/one/:id')
  async findOneCategory(@Param() param: IdParam) {
    const categoryId = param.id;
    try {
      const category =
        await this.assistantTemplateService.findOneCategory(categoryId);
      return { category };
      //
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(
          `Error fetching assistant template category: ${e.message}`,
        );
      } else {
        this.logger.error(`Error fetching assistant template category`);
      }
      throw new NotFoundException();
    }
  }
}
