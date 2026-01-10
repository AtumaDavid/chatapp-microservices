import { login, refreshAuthToken, register, revokeRefreshTokens } from '@/services/auth.service';
import { LoginInput, RegisterInput } from '@/types/auth';
import { HttpError } from '@chatapp/common';
import { asyncHandler } from '@chatapp/common/src/http/async-handler';
import { RequestHandler } from 'express';

export const registerHandler: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as RegisterInput;
  const tokens = await register(payload);
  res.status(201).send({ message: 'User registered successfully', tokens });
});

export const loginHandler: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as LoginInput;
  const tokens = await login(payload);
  res.json(tokens);
});

export const refreshTokenHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    throw new HttpError(400, 'Refresh token is required');
  }
  const tokens = await refreshAuthToken(refreshToken);
  res.json(tokens);
});

export const logoutHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { userId } = req.body as { userId?: string };
  if (!userId) {
    throw new HttpError(401, 'Unauthorized');
  }
  await revokeRefreshTokens(userId);
  res.status(200).send({ message: 'Logged out successfully' });
});
