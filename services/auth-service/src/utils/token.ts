import { env } from '@/config/env';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const ACCESS_TOKEN: Secret = env.JWT_SECRET;
const REFRESH_TOKEN: Secret = env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES_IN: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
};
const REFRESH_TOKEN_EXPIRES_IN: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export interface AccessTokenPayload {
  sub: string; // user ID
  email: string;
}

export interface RefreshTokenPayload {
  sub: string; // user ID
  tokenId: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN, ACCESS_TOKEN_EXPIRES_IN);
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES_IN);
};
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_TOKEN) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN) as RefreshTokenPayload;
};
