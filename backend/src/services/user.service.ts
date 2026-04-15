import pool from '../database';

const listUsers = async () => {
  const result = await pool.query('SELECT id, name, email FROM users ORDER BY name ASC');
  return result.rows;
};

export { listUsers };
