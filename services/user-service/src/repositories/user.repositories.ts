import { UserModel } from '@/db';
import { User } from '@/types/user';
import { AuthUserRegisteredPayload } from '@chatapp/common';

const toDomainUser = (model: UserModel): User => {
  return {
    id: model.id,
    email: model.email,
    displayName: model.displayName,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
};

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(id);
    return user ? toDomainUser(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.findAll({
      order: [['displayName', 'ASC']],
    });
    return users.map(toDomainUser);
  }

  async upsertFromAuthEvent(payload: AuthUserRegisteredPayload): Promise<User> {
    const [user] = await UserModel.upsert(
      {
        id: payload.id,
        email: payload.email,
        displayName: payload.displayName,
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.createdAt),
      },
      { returning: true },
    );
    return toDomainUser(user);
  }

  //   async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  //     const user = await UserModel.create(userData);
  //     return toDomainUser(user);
  //   }

  //   async update(
  //     id: string,
  //     updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>,
  //   ): Promise<User | null> {
  //     const user = await UserModel.findByPk(id);
  //     if (!user) {
  //       return null;
  //     }
  //     await user.update(updates);
  //     return toDomainUser(user);
  //   }

  //   async delete(id: string): Promise<boolean> {
  //     const deletedCount = await UserModel.destroy({ where: { id } });
  //     return deletedCount > 0;
  //   }
}

export const userRepository = new UserRepository();
