import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Lists table
export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color'), // Hex color code
  emoji: text('emoji'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Labels table
export const labels = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color'), // Hex color code
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Tasks table
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').references(() => lists.id),
  name: text('name').notNull(),
  description: text('description'),
  date: integer('date', { mode: 'timestamp' }), // Scheduled date
  deadline: integer('deadline', { mode: 'timestamp' }),
  priority: integer('priority').default(0), // 0: low, 1: medium, 2: high
  status: text('status').default('pending'), // pending, in_progress, completed, cancelled
  estimateMinutes: integer('estimate_minutes'), // Estimated time in minutes
  actualMinutes: integer('actual_minutes'), // Actual time spent in minutes
  recurringType: text('recurring_type'), // daily, weekly, monthly, yearly
  recurringInterval: integer('recurring_interval').default(1), // Every X days/weeks/etc
  recurringEndDate: integer('recurring_end_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Task-Labels many-to-many junction table
export const taskLabels = sqliteTable('task_labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  labelId: integer('label_id').references(() => labels.id).notNull(),
});

// Subtasks table
export const subtasks = sqliteTable('subtasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('pending'), // pending, completed
  order: integer('order').default(0), // For ordering subtasks
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Attachments table
export const attachments = sqliteTable('attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(), // Path to stored file
  fileSize: integer('file_size'), // Size in bytes
  mimeType: text('mime_type'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Reminders table
export const reminders = sqliteTable('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  reminderTime: integer('reminder_time', { mode: 'timestamp' }).notNull(),
  message: text('message'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Change logs table for audit trail
export const changeLogs = sqliteTable('change_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entityType: text('entity_type').notNull(), // task, list, label, etc.
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(), // create, update, delete
  oldValues: text('old_values'), // JSON string of old values
  newValues: text('new_values'), // JSON string of new values
  userId: integer('user_id'), // For future multi-user support
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// Relations
export const listsRelations = relations(lists, ({ many }) => ({
  tasks: many(tasks),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  taskLabels: many(taskLabels),
  subtasks: many(subtasks),
  attachments: many(attachments),
  reminders: many(reminders),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  task: one(tasks, {
    fields: [reminders.taskId],
    references: [tasks.id],
  }),
}));