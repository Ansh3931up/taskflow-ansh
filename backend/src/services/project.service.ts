import { v7 as uuidv7 } from 'uuid';
import pool from '../database';
import { ApiError } from '../utils/ApiError';
import { CreateProjectInput, UpdateProjectInput } from '../validations';

const listProjects = async (userId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at
     FROM projects p
     LEFT JOIN tasks t ON p.id = t.project_id
     WHERE p.owner_id = $1 OR t.assignee_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return { projects: result.rows, page, limit };
};

const createProject = async (userId: string, data: CreateProjectInput) => {
  const id = uuidv7();
  const result = await pool.query(
    `INSERT INTO projects (id, name, description, owner_id) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, name, description, owner_id, created_at`,
    [id, data.name, data.description || null, userId],
  );
  return result.rows[0];
};

const getProject = async (projectId: string) => {
  const projectRes = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
  if (projectRes.rows.length === 0) {
    throw new ApiError(404, 'not found');
  }
  const project = projectRes.rows[0];

  const tasksRes = await pool.query(
    'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
    [projectId],
  );

  return {
    ...project,
    tasks: tasksRes.rows,
  };
};

const updateProject = async (projectId: string, userId: string, data: UpdateProjectInput) => {
  const projectRes = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
  if (projectRes.rows.length === 0) throw new ApiError(404, 'not found');

  if (projectRes.rows[0].owner_id !== userId) throw new ApiError(403, 'forbidden');

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }

  if (fields.length === 0) return await getProject(projectId);

  values.push(projectId);
  const result = await pool.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  return result.rows[0];
};

const deleteProject = async (projectId: string, userId: string) => {
  const projectRes = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
  if (projectRes.rows.length === 0) throw new ApiError(404, 'not found');
  if (projectRes.rows[0].owner_id !== userId) throw new ApiError(403, 'forbidden');

  await pool.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);
  await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
  return true;
};

const getProjectStats = async (projectId: string, userId: string) => {
  const projectRes = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
  if (projectRes.rows.length === 0) throw new ApiError(404, 'not found');

  const statusRes = await pool.query(
    'SELECT status, COUNT(*)::int as count FROM tasks WHERE project_id = $1 GROUP BY status',
    [projectId],
  );

  const assigneeRes = await pool.query(
    `SELECT u.name as assignee_name, t.assignee_id, COUNT(*)::int as count 
     FROM tasks t 
     LEFT JOIN users u ON t.assignee_id = u.id 
     WHERE t.project_id = $1 AND t.assignee_id IS NOT NULL 
     GROUP BY t.assignee_id, u.name`,
    [projectId],
  );

  return {
    by_status: statusRes.rows,
    by_assignee: assigneeRes.rows,
  };
};

export { listProjects, createProject, getProject, updateProject, deleteProject, getProjectStats };
