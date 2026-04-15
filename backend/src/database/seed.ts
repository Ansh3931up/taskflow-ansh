import pool from './index';
import bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { logger } from '../utils/logger';

const runSeed = async () => {
  logger.info('Initializing workspace with seed data…');

  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const newUserId = uuidv7();

    const userRes = await pool.query<{ id: string }>(
      `INSERT INTO users (id, name, email, password)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         password = EXCLUDED.password,
         name = EXCLUDED.name
       RETURNING id`,
      [newUserId, 'Alex Johnson', 'test@example.com', hashedPassword],
    );
    const userId = userRes.rows[0].id;
    logger.info('Seed user: test@example.com');

    const projectId = uuidv7();
    await pool.query(
      `INSERT INTO projects (id, name, description, owner_id)
       VALUES ($1, $2, $3, $4)`,
      [
        projectId,
        'Platform Redesign Q4',
        'Coordinating the migration to the new Luxury SaaS design system and Ruby/Slate components.',
        userId,
      ],
    );

    await pool.query(
      `INSERT INTO tasks (id, title, description, status, priority, project_id, creator_id, assignee_id) VALUES
       ($1, $2, $3, 'done', 'high', $4, $5, $6),
       ($7, $8, $9, 'in_progress', 'medium', $4, $5, $6),
       ($10, $11, $12, 'todo', 'low', $4, $5, null)`,
      [
        uuidv7(),
        'Component Audit',
        'Audit all shared components for accessibility and responsiveness.',
        projectId,
        userId,
        userId,
        uuidv7(),
        'API Synchronization',
        'Ensure the new frontend endpoints match the backend controller signatures.',
        projectId,
        userId,
        userId,
        uuidv7(),
        'Stakeholder Review',
        'Prepare the prototype for the executive design review session.',
        projectId,
        userId,
      ],
    );
    logger.info('Seed project and tasks created.');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Seed failed');
    process.exit(1);
  }
};

void runSeed();
