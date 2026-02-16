// Base entity types derived from database schema

export type List = {
  id: number;
  name: string;
  color?: string;
  emoji?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Label = {
  id: number;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Task = {
  id: number;
  listId?: number;
  name: string;
  description?: string;
  date?: Date;
  deadline?: Date;
  priority: Priority;
  status: TaskStatus;
  estimateMinutes?: number;
  actualMinutes?: number;
  recurringType?: RecurringType;
  recurringInterval: number;
  recurringEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskLabel = {
  id: number;
  taskId: number;
  labelId: number;
};

export type Subtask = {
  id: number;
  taskId: number;
  name: string;
  description?: string;
  status: SubtaskStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Attachment = {
  id: number;
  taskId: number;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: Date;
};

export type Reminder = {
  id: number;
  taskId: number;
  reminderTime: Date;
  message?: string;
  isActive: boolean;
  createdAt: Date;
};

export type ChangeLog = {
  id: number;
  entityType: EntityType;
  entityId: number;
  action: Action;
  oldValues?: string;
  newValues?: string;
  userId?: number;
  timestamp: Date;
};

// Enums and literal types

export type Priority = 0 | 1 | 2; // 0: low, 1: medium, 2: high

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type SubtaskStatus = 'pending' | 'completed';

export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type EntityType = 'task' | 'list' | 'label' | 'subtask' | 'attachment' | 'reminder';

export type Action = 'create' | 'update' | 'delete';

// Relationship types

export type TaskWithRelations = Task & {
  list?: List;
  labels: Label[];
  subtasks: Subtask[];
  attachments: Attachment[];
  reminders: Reminder[];
};

export type ListWithTasks = List & {
  tasks: Task[];
};

export type LabelWithTasks = Label & {
  tasks: Task[];
};

// Form types

export type CreateListForm = {
  name: string;
  color?: string;
  emoji?: string;
};

export type UpdateListForm = Partial<CreateListForm>;

export type CreateLabelForm = {
  name: string;
  color?: string;
};

export type UpdateLabelForm = Partial<CreateLabelForm>;

export type CreateTaskForm = {
  listId?: number;
  name: string;
  description?: string;
  date?: Date;
  deadline?: Date;
  priority?: Priority;
  status?: TaskStatus;
  estimateMinutes?: number;
  actualMinutes?: number;
  recurringType?: RecurringType;
  recurringInterval?: number;
  recurringEndDate?: Date;
  labelIds?: number[];
};

export type UpdateTaskForm = Partial<CreateTaskForm>;

export type CreateSubtaskForm = {
  taskId: number;
  name: string;
  description?: string;
  status?: SubtaskStatus;
  order?: number;
};

export type UpdateSubtaskForm = Partial<Omit<CreateSubtaskForm, 'taskId'>>;

export type CreateAttachmentForm = {
  taskId: number;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
};

export type CreateReminderForm = {
  taskId: number;
  reminderTime: Date;
  message?: string;
  isActive?: boolean;
};

export type UpdateReminderForm = Partial<Omit<CreateReminderForm, 'taskId'>>;

// API response types

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TaskListResponse = PaginatedResponse<TaskWithRelations>;
export type ListListResponse = PaginatedResponse<ListWithTasks>;
export type LabelListResponse = PaginatedResponse<LabelWithTasks>;

// UI state types

export type TaskFilter = {
  listId?: number;
  labelIds?: number[];
  status?: TaskStatus[];
  priority?: Priority[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  search?: string;
};

export type TaskSort = {
  field: 'name' | 'date' | 'deadline' | 'priority' | 'status' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
};

export type TaskViewMode = 'list' | 'board' | 'calendar' | 'timeline';

export type UiState = {
  selectedTaskId?: number;
  selectedListId?: number;
  taskFilter: TaskFilter;
  taskSort: TaskSort;
  viewMode: TaskViewMode;
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
};

// Time tracking types

export type TimeEntry = {
  id: string; // UUID for client-side tracking
  taskId: number;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  description?: string;
};

export type TimeTrackingState = {
  activeEntry?: TimeEntry;
  entries: TimeEntry[];
  totalTimeToday: number;
  totalTimeThisWeek: number;
};

// Utility types

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type Id<T> = T & { id: number };

// Form validation types

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type FormState<T> = {
  data: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
  isDirty: boolean;
};