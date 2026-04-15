import { v7 as uuidv7 } from 'uuid';
import pool from '../database';
import { ApiError } from '../utils/ApiError';
import { hashPassword, comparePassword, generateToken } from '../utils/crypto';
import { RegisterInput, LoginInput } from '../validations';

const register = async (data: RegisterInput) => {
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (exists.rows.length > 0) {
    throw new ApiError(400, 'validation failed', { email: 'already exists' });
  }

  const hashedPassword = await hashPassword(data.password);
  const id = uuidv7();

  const result = await pool.query(
    'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
    [id, data.name, data.email, hashedPassword],
  );

  const user = result.rows[0];
  const token = generateToken({ id: user.id, email: user.email });

  return { token, user };
};

const login = async (data: LoginInput) => {
  const result = await pool.query('SELECT id, name, email, password FROM users WHERE email = $1', [
    data.email,
  ]);
  const user = result.rows[0];

  if (!user) throw new ApiError(401, 'unauthorized');

  const isValid = await comparePassword(data.password, user.password);
  if (!isValid) throw new ApiError(401, 'unauthorized');

  const token = generateToken({ id: user.id, email: user.email });

  return { token, user: { id: user.id, name: user.name, email: user.email } };
};

export { register, login };
