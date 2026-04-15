import { v7 as uuidv7 } from 'uuid';
import pool from '../database';
import { ApiError } from '../utils/ApiError';
import { CreateTaskInput, UpdateTaskInput } from '../validations';
import { assertUserHasProjectAccess } from './project.service';

const listTasks = async (
  projectId: string,
  userId: string,
  filters: { status?: string; assignee?: string; page?: number; limit?: number },
) => {
  await assertUserHasProjectAccess(projectId, userId);
  let query = 'SELECT * FROM tasks WHERE project_id = $1';
  const values: any[] = [projectId];
  let paramIndex = 2;

  if (filters.status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(filters.status);
  }
  if (filters.assignee === 'unassigned') {
    query += ` AND assignee_id IS NULL`;
  } else if (filters.assignee) {
    query += ` AND assignee_id = $${paramIndex++}`;
    values.push(filters.assignee);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  let countSql = 'SELECT COUNT(*)::int AS c FROM tasks WHERE project_id = $1';
  const countVals: unknown[] = [projectId];
  let ci = 2;
  if (filters.status) {
    countSql += ` AND status = $${ci++}`;
    countVals.push(filters.status);
  }
  if (filters.assignee === 'unassigned') {
    countSql += ' AND assignee_id IS NULL';
  } else if (filters.assignee) {
    countSql += ` AND assignee_id = $${ci++}`;
    countVals.push(filters.assignee);
  }
  const countRes = await pool.query(countSql, countVals);
  const total = countRes.rows[0]?.c ?? 0;

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return { tasks: result.rows, page, limit, total };
};

const createTask = async (projectId: string, creatorId: string, data: CreateTaskInput) => {
  const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
  if (projectCheck.rows.length === 0) throw new ApiError(404, 'project not found');
  await assertUserHasProjectAccess(projectId, creatorId);

  const id = uuidv7();
  const result = await pool.query(
    `INSERT INTO tasks (id, title, description, priority, project_id, assignee_id, due_date, creator_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      data.title,
      data.description || null,
      data.priority || 'medium',
      projectId,
      data.assignee_id || null,
      data.due_date || null,
      creatorId,
    ],
  );
  return result.rows[0];
};

const updateTask = async (taskId: string, userId: string, data: UpdateTaskInput) => {
  const authRes = await pool.query(
    `SELECT t.id, t.creator_id, t.assignee_id, p.owner_id
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     WHERE t.id = $1`,
    [taskId],
  );
  if (authRes.rows.length === 0) throw new ApiError(404, 'not found');
  const row = authRes.rows[0];
  const canEdit =
    row.owner_id === userId ||
    row.creator_id === userId ||
    (row.assignee_id != null && row.assignee_id === userId);
  if (!canEdit) throw new ApiError(403, 'forbidden');

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(value);
    }
  });

  if (fields.length === 1) {
    const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return res.rows[0];
  }

  values.push(taskId);
  const result = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  if (result.rows.length === 0) throw new ApiError(404, 'not found');
  return result.rows[0];
};

const deleteTask = async (taskId: string, userId: string) => {
  const taskRes = await pool.query(
    `SELECT t.creator_id, p.owner_id 
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     WHERE t.id = $1`,
    [taskId],
  );

  if (taskRes.rows.length === 0) throw new ApiError(404, 'not found');

  const { creator_id, owner_id } = taskRes.rows[0];
  if (creator_id !== userId && owner_id !== userId) {
    throw new ApiError(403, 'forbidden');
  }

  await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  return true;
};

export { listTasks, createTask, updateTask, deleteTask };
