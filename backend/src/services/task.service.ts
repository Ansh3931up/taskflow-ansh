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
  const id = uuidv7();
  const priority = data.priority || 'medium';
  const result = await pool.query(
    `INSERT INTO tasks (id, title, description, priority, project_id, assignee_id, due_date, creator_id)
     SELECT $1::uuid, $2, $3, $4::task_priority, p.id, $6::uuid, $7::date, $8::uuid
     FROM projects p
     WHERE p.id = $5::uuid
     AND (
       p.owner_id = $8::uuid
       OR EXISTS (SELECT 1 FROM tasks t WHERE t.project_id = p.id AND t.assignee_id = $8::uuid)
       OR EXISTS (SELECT 1 FROM tasks t WHERE t.project_id = p.id AND t.creator_id = $8::uuid)
     )
     RETURNING *`,
    [
      id,
      data.title,
      data.description || null,
      priority,
      projectId,
      data.assignee_id ?? null,
      data.due_date ?? null,
      creatorId,
    ],
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  const exists = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
  if (exists.rows.length === 0) {
    throw new ApiError(404, 'project not found');
  }
  throw new ApiError(403, 'forbidden');
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

  const allowed: (keyof UpdateTaskInput)[] = [
    'title',
    'description',
    'status',
    'priority',
    'assignee_id',
    'due_date',
  ];
  for (const key of allowed) {
    const value = data[key];
    if (value === undefined) continue;
    fields.push(`${key} = $${paramIndex++}`);
    values.push(value);
  }

  const extraKeys = Object.keys(data).filter((k) => !allowed.includes(k as keyof UpdateTaskInput));
  if (extraKeys.length > 0) {
    const fieldsMap = Object.fromEntries(extraKeys.map((k) => [k, 'not allowed']));
    throw new ApiError(400, 'validation failed', fieldsMap);
  }

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
  const del = await pool.query(
    `DELETE FROM tasks t
     USING projects p
     WHERE t.id = $1::uuid
     AND t.project_id = p.id
     AND (t.creator_id = $2::uuid OR p.owner_id = $2::uuid)
     RETURNING t.id`,
    [taskId, userId],
  );

  if (del.rows.length > 0) {
    return true;
  }

  const exists = await pool.query('SELECT id FROM tasks WHERE id = $1', [taskId]);
  if (exists.rows.length === 0) {
    throw new ApiError(404, 'not found');
  }
  throw new ApiError(403, 'forbidden');
};

export { listTasks, createTask, updateTask, deleteTask };
