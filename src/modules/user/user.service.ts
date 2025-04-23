import { comparePassword, hashPassword } from '@/common/utils/bcrypt';
import { UserAccountEntity } from '@/modules/account/entities/account.entity';
import { CreateUserBody } from '@/modules/user/dto/create-user-body.dto';
import { UpdateUserBody } from '@/modules/user/dto/update-user-body.dto';
import { DetailedUserEntity } from '@/modules/user/entities/detailed-user.entity';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { SessionUser } from './entities/session-user.entity';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    // super(UserService.name);
  }

  async create({ name, email, password, roleName }: CreateUserBody) {
    const exists = await this.findByEmail(email);
    if (exists) throw new ConflictException('User already registered');

    const hasedPassword = await hashPassword(password);
    return this.repository.create({
      name,
      email,
      password: hasedPassword,
      roleName,
    });
  }

  async createUserByRegistration({
    name,
    email,
    password,
    roleName,
  }: {
    name: string;
    email: string;
    password: string;
    roleName: 'user' | 'admin';
  }) {
    const user = await this.create({
      name,
      email,
      password,
      roleName,
    });

    const team = await this.repository.prisma.team.findFirst({
      where: {
        name: 'RG-Onboard-Team',
      },
    });

    if (!team) {
      throw new NotFoundException('Onboarding team not found');
    }

    // assign user to onboarding team
    await this.repository.prisma.teamUser.create({
      data: {
        userId: user.id,
        teamId: team.id,
      },
    });
  }

  async createWithoutPassword({
    name,
    email,
    roleName,
  }: {
    name: string;
    email: string;
    roleName: string;
  }) {
    const exists = await this.findByEmail(email);
    if (exists) throw new Error('Email already registered');

    return this.repository.create({
      name,
      email,
      password: null,
      roleName,
    });
  }

  async invite({
    name,
    email,
    teamId,
    roleName,
  }: {
    name: string;
    email: string;
    teamId: string;
    roleName: string;
  }) {
    const exists = await this.findByEmail(email);
    if (exists) throw new ConflictException('User already registered');

    const newUser = await this.repository.create({
      name,
      email,
      password: null,
      roleName,
      onboardedAt: new Date(),
    });

    // add user to team
    await this.repository.prisma.teamUser.create({
      data: {
        userId: newUser.id,
        teamId,
      },
    });

    const token = await this.createInviteToken({
      userId: newUser.id,
    });

    return {
      user: new UserEntity(newUser as any), // TODO: fix types
      inviteToken: token,
    };
  }

  async getAccountData({ userId }: { userId: string }): Promise<UserAccountEntity> {
    const user = await this.repository.prisma.user.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        totalCredits: true,
        onboardedAt: true,
        lastLoginAt: true,
        emailVerifiedAt: true,
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
                id: true,
                name: true,
              },
            },
          },
        },
      },
      where: { id: userId },
    });

    if (!user) throw new NotFoundException(`User ${userId} not found`);
    if (!user.teams || user.teams.length === 0) {
      throw new NotFoundException(`User ${userId} has no teams`);
    }

    return UserAccountEntity.fromInput({
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      emailVerifiedAt: user.emailVerifiedAt,
      onboardedAt: user.onboardedAt,
      lastLoginAt: user.lastLoginAt,
      roles: user.roles.map((r) => ({
        id: r.role.id,
        name: r.role.name,
      })),
      activeTeamId: user.teams[0].team.id, // TODO: change to activeTeamId
      teams: user.teams.map((t) => ({
        id: t.team.id,
        name: t.team.name,
      })),
      organisation: {
        id: user.teams[0].team.organisation.id,
        name: user.teams[0].team.organisation.name,
      },
    });
  }

  async findOne(payload: { userId: string }): Promise<Partial<UserEntity>> {
    if (!payload.userId) throw new Error('User ID is required');

    const user = await this.repository.findById({
      userId: payload.userId,
    });
    if (!user) throw new NotFoundException(`User ${payload.userId} not found`);

    // flatten the user.roles array
    const roles = user.roles.map((r) => r.role.name);

    return new UserEntity({ ...user, roles } as any); // TODO: fix types
  }

  async getSessionUser({ userId }: { userId: string }): Promise<SessionUser> {
    if (!userId) throw new Error('User ID is required');

    const user = await this.repository.prisma.user.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        totalCredits: true,
        onboardedAt: true,
        lastLoginAt: true,
        emailVerifiedAt: true,
        teams: {
          select: {
            teamId: true,
            team: {
              select: {
                id: true,
                name: true,
                organisationId: true,
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
      where: { id: userId },
    });

    if (!user) throw new NotFoundException(`User ${userId} not found`);

    return SessionUser.fromInput({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      lastLoginAt: user.lastLoginAt,
      totalCredits: user.totalCredits,
      hasEmailVerified: user.emailVerifiedAt !== null,
      hasOnboarded: user.onboardedAt !== null,
      organisationId: user.teams?.[0]?.team.organisationId || '',
      activeTeamId: user.teams?.[0]?.team.id || '',
      roles: user.roles.map((r) => r.role.name),
      teams: user.teams.map((t) => t.team.id),
    });
  }

  async findByEmail(email: string): Promise<Partial<User>> {
    if (!email || !email.includes('@')) throw new Error('Invalid email');
    return this.repository.findByEmail(email);
  }

  async findAll(): Promise<Partial<UserEntity>[]> {
    const users = await this.repository.findAll();
    return users.map((user) => new UserEntity(user as any));
  }

  async findAllPaginated({
    organisationId,
    page,
    limit,
  }: {
    organisationId: string;
    page?: number;
    limit?: number;
  }) {
    const [users, meta] = await this.repository.findAllPaginated(
      {
        organisationId,
      },
      {
        page,
        limit,
      },
    );
    return [
      users.map((user) =>
        DetailedUserEntity.fromInput({
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
          onboardedAt: user.onboardedAt,
          lastLoginAt: user.lastLoginAt,
          emailVerifiedAt: user.emailVerifiedAt,
          roles: user.roles.map((r) => ({
            id: r.role.id,
            name: r.role.name,
          })),
          teams: user.teams.map((t) => ({
            id: t.team.id,
            name: t.team.name,
          })),
          organisation: {
            id: user.teams[0].team.organisation.id,
            name: user.teams[0].team.organisation.name,
          },
        }),
      ),
      meta,
    ]; // TODO: fix types
  }

  async userExists({ userId }: { userId: string }) {
    return this.repository.exists(userId);
  }

  async updateUserName(
    userId: string,
    pay: {
      firstName: string;
      lastName: string;
    },
  ) {
    return this.repository.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: pay.firstName,
        lastName: pay.lastName,
        name: `${pay.firstName} ${pay.lastName}`,
      },
    });
  }

  async updateUserPassword(userId: string, pay: { oldPassword: string; newPassword: string }) {
    const user = await this.repository.findById({ userId }, { withPassword: true });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const isPasswordMatch = await comparePassword(pay.oldPassword, user.password);
    if (!isPasswordMatch) throw new Error('Invalid password');

    const hashedPassword = await hashPassword(pay.newPassword);
    return this.repository.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async updateOnlyPassword({ userId, password }: { userId: string; password: string }) {
    const hashedPassword = await hashPassword(password);
    return this.repository.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserBody): Promise<Partial<UserEntity>> {
    if (!id) throw new Error('User ID is required');

    const exists = await this.userExists({ userId: id });
    if (!exists) throw new NotFoundException(`User ${id} not found`);

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    const user = await this.repository.update(id, updateUserDto);
    return new UserEntity(user as any); // TODO: fix types
  }

  async updateLastLogin(userId: string) {
    if (!userId) throw new Error('User ID is required');
    return this.repository.update(userId, { lastLoginAt: new Date() });
  }

  async delete(userId: string) {
    throw new Error('Not implemented');
  }

  async softDelete(userId: string) {
    return this.repository.softDelete(userId);
  }

  async softDeleteUser(userId: string, pay: { password: string }) {
    const user = await this.repository.findById({ userId }, { withPassword: true });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const isPasswordMatch = await comparePassword(pay.password, user.password);
    if (!isPasswordMatch) throw new Error('Invalid password');

    return this.repository.softDelete(userId);
  }

  async createInviteToken(payload: { userId: string }): Promise<string> {
    const jwtPayload = {
      sub: payload.userId,
      iss: this.configService.get<string>('JWT_ISSUER', 'https://api.ragna.io'),
    };
    return new Promise((resolve, reject) => {
      const signOptions = {
        expiresIn: this.configService.get('JWT_INVITE_EXPIRES_IN', '1h'),
      };
      jwt.sign(
        jwtPayload,
        this.configService.get('JWT_INVITE_SECRET'),
        signOptions,
        (err, token) => {
          if (err) reject(err);
          resolve(token);
        },
      );
    });
  }

  // POLICIES
  canAccessUser(reqUser: RequestUser, user: UserEntity) {
    return reqUser.organisationId === user.organisationId;
  }
}
