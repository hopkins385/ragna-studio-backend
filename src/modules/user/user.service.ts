import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { comparePassword, hashPassword } from 'src/common/utils/bcrypt';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
