import { sequelize } from '@/DB/sequelize';
import { RefreshToken, UserCredentials } from '@/models';
import { AuthResponse, RegisterInput } from '@/types/auth';
import { hashPassword, signAccessToken, signRefreshToken } from '@/utils/token';
import { HttpError } from '@chatapp/common';
import { Transaction } from 'sequelize';
import crypto from 'crypto';
import { publishAuthUserRegisteredEvent } from '@/messaging/event-publishing';

const REFRESH_TOKEN_TTL_DAYS = 30;

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
    const refreshTokenRecord = await createRefreshToken(user.id, transaction);
    await transaction.commit();
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id, tokenId: refreshTokenRecord });
    // return {
    //   accessToken,
    //   refreshToken,
    //   user: {
    //     id: user.id,
    //     email: user.email,
    //     displayName: user.displayName,
    //     createdAt: user.createdAt,
    //   },
    // };

    const userData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };

    publishAuthUserRegisteredEvent(userData);

    return {
      accessToken,
      refreshToken,
      user: userData,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createRefreshToken = async (userId: string, transaction?: Transaction): Promise<string> => {
  // Implementation for creating and storing a refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS); // 30 days from now

  const tokenId = crypto.randomUUID();

  const record = await RefreshToken.create(
    {
      userId,
      tokenId,
      expiresAt,
    },
    { transaction },
  );
  return record.tokenId;
  // return tokenId;
};

const createAccessToken = (userId: string): string => {
  // Implementation for creating an access token
  return 'accessTokenPlaceholder';
};
