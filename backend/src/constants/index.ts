export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export const TASK_STATUSES = Object.values(TaskStatus) as [string, ...string[]];
export const TASK_PRIORITIES = Object.values(TaskPriority) as [string, ...string[]];
