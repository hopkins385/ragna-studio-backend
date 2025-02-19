import { createId } from '@paralleldrive/cuid2';
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { User } from '@prisma/client';
import {
  BaseRepository,
  PaginationOptions,
} from '@/common/types/repository.types';

interface CreateUser {
  name: string;
  email: string;
  password?: string;
}

@Injectable()
export class UserRepository extends BaseRepository<User> {
  readonly prisma: ExtendedPrismaClient;
  constructor(
    @Inject('PrismaService')
    private db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    super();
    this.prisma = this.db.client;
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        totalCredits: true,
        onboardedAt: true,
        teams: {
          select: {
            teamId: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: { id },
    });
  }

  async findByIdWithPassword(id: string) {
    return this.prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
      where: { id },
    });
  }

  // used for authentication
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
      where: { email, deletedAt: null },
    });
  }

  async findAll(): Promise<Array<Partial<User>>> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { deletedAt: null },
    });
  }

  async findAllPaginated(
    { page, limit }: PaginationOptions = { page: 1, limit: 10 },
  ) {
    return this.prisma.user
      .paginate({
        select: {
          id: true,
          name: true,
          email: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        where: { deletedAt: null },
      })
      .withPages({ page, limit });
  }

  async create({ name, email, password }: CreateUser): Promise<User> {
    return this.prisma.user.create({
      data: {
        id: createId(),
        name,
        email,
        password,
      },
    });
  }

  async update(id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const result = await this.prisma.user.delete({
      where: { id },
    });
    return !!result;
  }

  async softDelete(id: string) {
    const result = await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    return !!result;
  }

  async findMany(filter: Partial<User>) {
    return this.prisma.user.findMany({
      where: filter,
    });
  }
}
