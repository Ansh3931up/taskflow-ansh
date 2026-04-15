import { Request, Response } from 'express';
import { listUsers as svcListUsers } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';

const listUsers = async (req: Request, res: Response) => {
  const users = await svcListUsers();
  return res.json(new ApiResponse(200, users));
};

export { listUsers };
