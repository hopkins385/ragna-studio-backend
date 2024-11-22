import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomPrismaModule, CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaConfigService } from './prisma-config.service';
import { ExtendedPrismaClient } from './prisma.extension';

@Module({
  imports: [
    CustomPrismaModule.forRootAsync({
      isGlobal: true,
      name: 'PrismaService',
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: ExtendedPrismaConfigService,
    }),
  ],
})
export class DatabaseModule
  implements NestModule, OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.client.$connect();
      console.log('Successfully connected to the database');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      throw error; // Re-throw to prevent app from starting with failed DB connection
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.client.$disconnect();
      console.log('Successfully disconnected from the database');
    } catch (error) {
      console.error('Failed to disconnect from the database:', error);
      throw error;
    }
  }

  configure(consumer: MiddlewareConsumer) {}
}
