export type TaskStatus = 'to-do' | 'in-progress' | 'done';
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface Subtask {
  id: string;
  title: string;
  detail?: string;
  completed: boolean;
  priority?: TaskPriority;
  estimate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  priorityLabel?: string;
  tags: string[];
  subtasks: Subtask[];
  assignee: {
    name: string;
    avatar: string;
    role: string;
  };
  dueDate: string;
  dueLabel?: string;
  pomodoro: {
    current: number;
    total: number;
    spentHours: number;
  };
  progress?: number;
  columnProgressLabel?: string;
  createdAt: string;
  updatedAt: string;
  version?: string;
  inspecting?: boolean;
}

export type WorkspaceView = 'board-view' | 'list-view' | 'calendar' | 'analytics' | 'focus-mode' | 'settings';
