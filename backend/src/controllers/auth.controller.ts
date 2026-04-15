import { Request, Response } from 'express';
import { register, login } from '../services';
import { asyncHandler } from '../utils/asyncHandler';

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await register(req.body);
  // Natively returning raw object to exactly mimic Mock API Spec `{ token, user: {...} }`
  return res.status(201).json(data);
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const data = await login(req.body);
  return res.status(200).json(data);
});

export { registerUser, loginUser };
