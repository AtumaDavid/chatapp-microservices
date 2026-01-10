import { sequelize } from '@/DB/sequelize';
import { RefreshToken, UserCredentials } from '@/models';
import { AuthResponse, AuthToken, LoginInput, RegisterInput } from '@/types/auth';
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from '@/utils/token';
import { HttpError } from '@chatapp/common';
import { Op, Transaction } from 'sequelize';
import crypto from 'crypto';
import { publishAuthUserRegisteredEvent } from '@/messaging/event-publishing';
import { logger } from '@/utils/logger';

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

export const login = async (input: LoginInput): Promise<AuthToken> => {
  const credential = await UserCredentials.findOne({ where: { email: { [Op.eq]: input.email } } });
  if (!credential) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await verifyPassword(input.password, credential.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const accessToken = signAccessToken({ sub: credential.id, email: credential.email });
  const refreshTokenId = await createRefreshToken(credential.id);
  const refreshToken = signRefreshToken({ sub: credential.id, tokenId: refreshTokenId });

  return {
    accessToken,
    refreshToken,
  };
};

export const refreshAuthToken = async (
  refreshTokenId: string,
  // userId: string,
): Promise<AuthToken> => {
  const payload = verifyRefreshToken(refreshTokenId);

  const storedToken = await RefreshToken.findOne({
    where: {
      userId: payload.sub,
      tokenId: payload.tokenId,
      // expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!storedToken) {
    throw new HttpError(401, 'Invalid or expired refresh token');
  }

  if (storedToken.expiresAt.getTime() < Date.now()) {
    // Optionally, you might want to delete the used refresh token here to prevent reuse
    await storedToken.destroy();
    throw new HttpError(401, 'Expired refresh token');
  }

  const credential = await UserCredentials.findByPk(payload.sub);
  if (!credential) {
    logger.warn(`UserCredentials not found for userId: ${payload.sub}`);
    throw new HttpError(401, 'User not found');
  }

  // Invalidate the used refresh token
  await storedToken.destroy();

  const newRefreshTokenId = await createRefreshToken(credential.id);

  return {
    accessToken: signAccessToken({ sub: credential.id, email: credential.email }),
    refreshToken: signRefreshToken({ sub: credential.id, tokenId: newRefreshTokenId }),
  };
};

export const revokeRefreshTokens = async (userId: string): Promise<void> => {
  await RefreshToken.destroy({ where: { userId } });
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
