import type { LucideIcon } from 'lucide-react';
import { CircleDot, CircleArrowRight, CircleCheck } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '@/types';

/** Issue-style status: labels and lozenge colors inspired by Jira / team boards */
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: LucideIcon }> =
  {
    todo: {
      label: 'To do',
      color:
        'border-blue-500/35 bg-blue-500/10 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-200',
      icon: CircleDot,
    },
    in_progress: {
      label: 'In progress',
      color:
        'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:border-amber-400/35 dark:bg-amber-500/10 dark:text-amber-100',
      icon: CircleArrowRight,
    },
    done: {
      label: 'Done',
      color:
        'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200',
      icon: CircleCheck,
    },
  };

/** Priority lozenges — flat, no glow (reads calmer on dark UI) */
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: {
    label: 'Low',
    color: 'border-border bg-muted/60 text-muted-foreground',
  },
  medium: {
    label: 'Medium',
    color: 'border-sky-500/35 bg-sky-500/10 text-sky-800 dark:text-sky-200',
  },
  high: {
    label: 'High',
    color: 'border-orange-500/45 bg-orange-500/10 text-orange-900 dark:text-orange-100',
  },
};
