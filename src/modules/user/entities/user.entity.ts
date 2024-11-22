import { Chat, Credit, Team, User as UserModel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';

export class UserEntity implements UserModel {
  @ApiProperty({
    example: 'cuid12345',
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'device12345',
    description: 'The device ID of the user',
    required: false,
  })
  deviceId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  name: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
    required: false,
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    required: false,
  })
  lastName: string;

  @Exclude()
  password: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The last login time of the user',
    required: false,
  })
  lastLoginAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The email verification time of the user',
    required: false,
  })
  emailVerified: Date;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'The profile image of the user',
    required: false,
  })
  image: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The creation time of the user',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The last update time of the user',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The deletion time of the user',
    required: false,
  })
  deletedAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The onboarding time of the user',
    required: false,
  })
  onboardedAt: Date;

  // relations
  @ApiProperty({
    // type: () => Role,
    isArray: true,
    required: false,
  })
  credit?: Partial<Credit>[];

  @ApiProperty({
    // type: () => Role,
    isArray: true,
    required: false,
  })
  roles?: string[];

  @ApiProperty({
    // type: () => any,
    isArray: true,
    required: false,
  })
  teams?: {
    team: Partial<Team>;
  }[];

  @ApiProperty({
    type: () => ChatEntity,
    isArray: true,
    required: false,
  })
  chats?: Partial<Chat>[];

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
