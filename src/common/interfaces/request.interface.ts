import { UserEntity } from '@/modules/user/entities/user.entity';
import type { Request } from 'express';

export interface ApiRequest extends Request {
  user: UserEntity;
}
