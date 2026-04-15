import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Establish singleton connection pool (No ORM magic, pure querying)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/taskflow',
});

export default pool;
