import { authProxyService } from '@/services/auth-proxy.service';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  revokeSchema,
} from '@/validation/auth.schema';
import { AsyncHandler } from '@chatapp/common';

export const registerUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const response = await authProxyService.register(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const tokens = await authProxyService.login(payload);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

export const refreshTokens: AsyncHandler = async (req, res, next) => {
  try {
    const payload = refreshTokenSchema.parse(req.body);
    const tokens = await authProxyService.refreshToken(payload);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

export const revokeUserTokens: AsyncHandler = async (req, res, next) => {
  try {
    const payload = revokeSchema.parse(req.body);
    await authProxyService.revokeTokens(payload);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
