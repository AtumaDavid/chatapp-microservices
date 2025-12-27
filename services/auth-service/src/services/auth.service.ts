import { sequelize } from '@/DB/sequelize';
import { UserCredentials } from '@/models';
import { AuthResponse, RegisterInput } from '@/types/auth';
import { hashPassword } from '@/utils/token';
import { HttpError } from '@chatapp/common';

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const existing = await UserCredentials.findOne({ where: { email: input.email } });

  if (existing) {
    throw new HttpError(409, 'Email already in use');
  }

  const transaction = await sequelize.transaction();

  try {
    const passwordHash = await hashPassword(input.password);
    const user = await UserCredentials.create(
      {
        email: input.email,
        displayName: input.displayName,
        passwordHash,
      },
      { transaction },
    );
    // await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
