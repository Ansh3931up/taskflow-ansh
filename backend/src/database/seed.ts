import pool from './index';
import bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { logger } from '../utils/logger';

const runSeed = async () => {
  logger.info('🌱 Starting Database Seeding with Time-Ordered UUIDv7...');

  try {
    // 1. Seed User
    const hashedPassword = await bcrypt.hash('password123', 12);
    const userId = uuidv7();

    await pool.query(
      `INSERT INTO users (id, name, email, password) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;`,
      [userId, 'Test Reviewer', 'test@example.com', hashedPassword],
    );
    logger.info(`✅ Seeded User: test@example.com (UUIDv7: ${userId})`);

    // 2. Seed Project
    const projectId = uuidv7();
    await pool.query(
      `INSERT INTO projects (id, name, description, owner_id) 
       VALUES ($1, $2, $3, $4);`,
      [projectId, 'Take-Home Assessment Assessment', 'Grading the TaskFlow application', userId],
    );
    logger.info(`✅ Seeded Project: (UUIDv7: ${projectId})`);

    // 3. Seed 3 Tasks (Different Statuses)
    await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id) VALUES 
       ($1, $2, $3, 'done', 'high', $4, $5),
       ($6, $7, $8, 'in_progress', 'medium', $4, $5),
       ($9, $10, $11, 'todo', 'low', $4, null);`,
      [
        uuidv7(),
        'Deploy Postgres Docker',
        'Stood up the DB correctly',
        projectId,
        userId,
        uuidv7(),
        'Review Migrations',
        'Check Dbmate up/down pure SQL architecture',
        projectId,
        userId,
        uuidv7(),
        'Grade Frontend API',
        'Click around the ShadCN UI',
        projectId,
      ],
    );
    logger.info('✅ Seeded 3 Tasks safely with UUIDv7.');

    logger.info('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, '❌ Seeding Failed!');
    process.exit(1);
  }
};

runSeed();
