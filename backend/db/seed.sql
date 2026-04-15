-- Seed data for Taskflow
-- Users (Password: password123)
INSERT INTO users (id, name, email, password) VALUES 
('019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3a', 'Test User', 'test@example.com', '$2b$12$uY.mPZ50jI8VzLhG.E3O6.r6v.Y7D7h9P6y6O.O0rK8jY0rK8jY0r'),
('019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3b', 'Jane Smith', 'jane@example.com', '$2b$12$uY.mPZ50jI8VzLhG.E3O6.r6v.Y7D7h9P6y6O.O0rK8jY0rK8jY0r')
ON CONFLICT (id) DO NOTHING;

-- Project
INSERT INTO projects (id, name, description, owner_id) VALUES
('019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3c', 'Taskflow MVP', 'Initial build of the task management system.', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3a')
ON CONFLICT (id) DO NOTHING;

-- Tasks
INSERT INTO tasks (id, title, description, status, priority, project_id, creator_id, assignee_id, due_date) VALUES
('019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3d', 'Setup Database schema', 'Create tables for users, projects, and tasks.', 'done', 'high', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3c', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3a', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3a', '2026-04-14'),
('019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3e', 'Build Authentication API', 'Implement JWT login and registration.', 'in_progress', 'medium', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3c', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3a', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3a', '2026-04-15'),
('019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3f', 'Design Frontend UI', 'Create responsive React components with Tailwind.', 'todo', 'low', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3c', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3a', '019d8de2-4c5b-7b1d-9f4a-8f9e0d1c2b3b', '2026-04-20')
ON CONFLICT (id) DO NOTHING;
