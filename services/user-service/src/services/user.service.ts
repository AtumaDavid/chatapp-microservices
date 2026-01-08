import { sequelize } from '@/db';
import { userRepository, type UserRepository } from '@/repositories/user.repositories';
import type { User, CreateUserInput } from '@/types/user';
import { AuthUserRegisteredPayload } from '@chatapp/common';

class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async syncFromAuthUser(payload: AuthUserRegisteredPayload): Promise<User> {
    const user = await this.userRepository.upsertFromAuthEvent(payload);
    return user;
  }
}

export const userService = new UserService(userRepository);
