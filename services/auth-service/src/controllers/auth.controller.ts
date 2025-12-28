import { register } from '@/services/auth.service';
import { RegisterInput } from '@/types/auth';
import { asyncHandler } from '@chatapp/common/src/http/async-handler';
import { RequestHandler } from 'express';

export const registerHandler: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as RegisterInput;
  const tokens = await register(payload);
  res.status(201).send({ message: 'User registered successfully', tokens });
});
