import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { comparePassword, hashPassword } from 'src/common/utils/bcrypt';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { SessionUser } from './entities/session-user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async create({ name, email, password }: CreateUserDto) {
    const exists = await this.findByEmail(email);
    if (exists) throw new Error('Email already registered');

    const hasedPassword = await hashPassword(password);
    return this.userRepository.create({
      name,
      email,
      password: hasedPassword,
    });
  }

  async createWithoutPassword({
    name,
    email,
  }: {
    name: string;
    email: string;
  }) {
    const exists = await this.findByEmail(email);
    if (exists) throw new Error('Email already registered');

    return this.userRepository.create({
      name,
      email,
    });
  }

  async findOne(id: string): Promise<Partial<UserEntity>> {
    if (!id) throw new Error('User ID is required');

    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);

    // flatten the user.roles array
    const roles = user.roles.map((r) => r.role.name);

    return new UserEntity({ ...user, roles } as any); // TODO: fix types
  }

  async getSessionUser({ userId }: { userId: string }): Promise<SessionUser> {
    if (!userId) throw new Error('User ID is required');

    const user = await this.userRepository.prisma.user.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        onboardedAt: true,
        lastLoginAt: true,
        emailVerifiedAt: true,
        credit: {
          select: {
            amount: true,
          },
        },
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
      hasEmailVerified: user.emailVerifiedAt !== null,
      hasOnboarded: user.onboardedAt !== null,
      firstTeamId: user.teams?.[0]?.team.id || '',
      credits: user.credit.reduce((acc, c) => acc + c.amount, 0),
      roles: user.roles.map((r) => r.role.name),
      teams: user.teams.map((t) => t.team.id),
    });
  }

  async findByEmail(email: string): Promise<Partial<User>> {
    if (!email || !email.includes('@')) throw new Error('Invalid email');
    return this.userRepository.findByEmail(email);
  }

  async findAll(): Promise<Partial<UserEntity>[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => new UserEntity(user as any));
  }

  async findAllPaginated() {
    const [users, meta] = await this.userRepository.findAllPaginated();
    return [users.map((user) => new UserEntity(user as any)), meta]; // TODO: fix types
  }

  async updateUserName(
    userId: string,
    pay: {
      firstName: string;
      lastName: string;
    },
  ) {
    return this.userRepository.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: pay.firstName,
        lastName: pay.lastName,
        name: `${pay.firstName} ${pay.lastName}`,
      },
    });
  }

  async updateUserPassword(
    userId: string,
    pay: { oldPassword: string; newPassword: string },
  ) {
    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const isPasswordMatch = await comparePassword(
      pay.oldPassword,
      user.password,
    );
    if (!isPasswordMatch) throw new Error('Invalid password');

    const hashedPassword = await hashPassword(pay.newPassword);
    return this.userRepository.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<UserEntity>> {
    if (!id) throw new Error('User ID is required');

    const exists = await this.userRepository.exists(id);
    if (!exists) throw new NotFoundException(`User ${id} not found`);

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    const user = await this.userRepository.update(id, updateUserDto);
    return new UserEntity(user as any); // TODO: fix types
  }

  async updateLastLogin(userId: string) {
    if (!userId) throw new Error('User ID is required');
    return this.userRepository.update(userId, { lastLoginAt: new Date() });
  }

  async delete(userId: string) {
    throw new Error('Not implemented');
  }

  async softDelete(userId: string) {
    return this.userRepository.softDelete(userId);
  }

  async softDeleteUser(userId: string, pay: { password: string }) {
    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const isPasswordMatch = await comparePassword(pay.password, user.password);
    if (!isPasswordMatch) throw new Error('Invalid password');

    return this.userRepository.softDelete(userId);
  }

  async createInviteToken(payload: any) {
    return new Promise((resolve, reject) => {
      const signOptions = {
        expiresIn: this.configService.get('JWT_INVITE_EXPIRES_IN', '1h'),
      };
      jwt.sign(
        payload,
        this.configService.get('JWT_INVITE_SECRET'),
        signOptions,
        (err, token) => {
          if (err) reject(err);
          resolve(token);
        },
      );
    });
  }
}
