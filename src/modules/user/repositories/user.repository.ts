import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { User } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';

interface PaginationOptions {
  page: number;
  limit: number;
}

interface CreateUser {
  name: string;
  email: string;
  roleName: string;
  password?: string;
  onboardedAt?: Date;
}

@Injectable()
export class UserRepository {
  readonly prisma: ExtendedPrismaClient;
  constructor(
    @Inject('PrismaService')
    private db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }

  async findById(
    payload: { userId: string },
    options?: { includeDeleted?: boolean; withPassword?: boolean },
  ) {
    return this.prisma.user.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        name: true,
        password: options?.withPassword ? true : false,
        firstName: true,
        lastName: true,
        email: true,
        totalCredits: true,
        onboardedAt: true,
        image: true,
        teams: {
          select: {
            teamId: true,
            team: {
              select: {
                id: true,
                name: true,
                organisationId: true,
                organisation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
      where: {
        id: payload.userId,
        deletedAt: options?.includeDeleted ? undefined : null,
      },
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
    payload: { organisationId: string },
    { page, limit }: PaginationOptions = { page: 1, limit: 10 },
  ) {
    return this.prisma.user
      .paginate({
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          lastLoginAt: true,
          onboardedAt: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          teams: {
            select: {
              team: {
                select: {
                  id: true,
                  name: true,
                  organisation: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        where: {
          teams: {
            some: {
              team: {
                organisationId: payload.organisationId,
              },
            },
          },
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      })
      .withPages({ page, limit, includePageCount: true });
  }

  async exists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    return !!user;
  }

  async create({ name, email, password, roleName, onboardedAt }: CreateUser): Promise<User> {
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ').slice(1).join(' ');

    const role = await this.prisma.role.findFirst({
      where: { name: roleName },
    });

    if (!role.id) {
      throw new Error('Role not found');
    }

    const user = await this.prisma.user.create({
      data: {
        id: createId(),
        name,
        firstName,
        lastName,
        email,
        password,
        onboardedAt,
      },
    });

    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });

    return user;
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
