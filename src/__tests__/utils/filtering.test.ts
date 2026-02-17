import { describe, it, expect } from 'vitest';
import { TaskWithRelations, TaskFilter } from '@/lib/types';

// Mock filtering utility functions
const filterTasks = (tasks: TaskWithRelations[], filter: TaskFilter): TaskWithRelations[] => {
  return tasks.filter(task => {
    // List filter
    if (filter.listId !== undefined && task.listId !== filter.listId) {
      return false;
    }

    // Label filter
    if (filter.labelIds && filter.labelIds.length > 0) {
      const taskLabelIds = task.labels.map(label => label.id);
      if (!filter.labelIds.some(labelId => taskLabelIds.includes(labelId))) {
        return false;
      }
    }

    // Status filter
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(task.status)) {
        return false;
      }
    }

    // Priority filter
    if (filter.priority && filter.priority.length > 0) {
      if (!filter.priority.includes(task.priority)) {
        return false;
      }
    }

    // Date range filter
    if (filter.dateRange) {
      const taskDate = task.date || task.createdAt;
      if (filter.dateRange.start && taskDate < filter.dateRange.start) {
        return false;
      }
      if (filter.dateRange.end && taskDate > filter.dateRange.end) {
        return false;
      }
    }

    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      const searchableText = `${task.name} ${task.description || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

const sortTasks = (tasks: TaskWithRelations[], sort: { field: string; direction: 'asc' | 'desc' }): TaskWithRelations[] => {
  return [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sort.field) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'date':
        aValue = a.date || a.createdAt;
        bValue = b.date || b.createdAt;
        break;
      case 'deadline':
        aValue = a.deadline || new Date('9999-12-31');
        bValue = b.deadline || new Date('9999-12-31');
        break;
      case 'priority':
        aValue = a.priority;
        bValue = b.priority;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case 'updatedAt':
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sort.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sort.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

describe('Task Filtering and Sorting', () => {
  const mockTasks: TaskWithRelations[] = [
    {
      id: 1,
      name: 'Urgent Work Task',
      description: 'Important work item',
      status: 'pending',
      priority: 2,
      date: new Date('2024-01-01'),
      deadline: new Date('2024-01-02'),
      listId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      list: { id: 1, name: 'Work', color: '#ff0000', emoji: '💼', createdAt: new Date(), updatedAt: new Date() },
      labels: [
        { id: 1, name: 'Urgent', color: '#ff0000', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Work', color: '#0000ff', createdAt: new Date(), updatedAt: new Date() },
      ],
      subtasks: [],
      attachments: [],
      reminders: [],
    },
    {
      id: 2,
      name: 'Personal Task',
      description: 'Personal item',
      status: 'completed',
      priority: 1,
      date: new Date('2024-01-02'),
      deadline: new Date('2024-01-03'),
      listId: 2,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      list: { id: 2, name: 'Personal', color: '#00ff00', emoji: '🏠', createdAt: new Date(), updatedAt: new Date() },
      labels: [
        { id: 3, name: 'Personal', color: '#00ff00', createdAt: new Date(), updatedAt: new Date() },
      ],
      subtasks: [],
      attachments: [],
      reminders: [],
    },
    {
      id: 3,
      name: 'Low Priority Task',
      description: 'Not urgent',
      status: 'pending',
      priority: 0,
      date: new Date('2024-01-03'),
      deadline: new Date('2024-01-04'),
      listId: 1,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      list: { id: 1, name: 'Work', color: '#ff0000', emoji: '💼', createdAt: new Date(), updatedAt: new Date() },
      labels: [],
      subtasks: [],
      attachments: [],
      reminders: [],
    },
  ];

  describe('filterTasks', () => {
    it('filters by listId', () => {
      const filter: TaskFilter = { listId: 1 };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual([1, 3]);
    });

    it('filters by labelIds', () => {
      const filter: TaskFilter = { labelIds: [1] };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('filters by multiple labelIds (OR logic)', () => {
      const filter: TaskFilter = { labelIds: [1, 3] };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id).sort()).toEqual([1, 2]);
    });

    it('filters by status', () => {
      const filter: TaskFilter = { status: ['pending'] };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id).sort()).toEqual([1, 3]);
    });

    it('filters by multiple statuses', () => {
      const filter: TaskFilter = { status: ['pending', 'completed'] };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(3);
    });

    it('filters by priority', () => {
      const filter: TaskFilter = { priority: [2] };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('filters by multiple priorities', () => {
      const filter: TaskFilter = { priority: [0, 1] };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id).sort()).toEqual([2, 3]);
    });

    it('filters by date range start', () => {
      const filter: TaskFilter = {
        dateRange: { start: new Date('2024-01-02') }
      };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id).sort()).toEqual([2, 3]);
    });

    it('filters by date range end', () => {
      const filter: TaskFilter = {
        dateRange: { end: new Date('2024-01-01') }
      };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('filters by search term in name', () => {
      const filter: TaskFilter = { search: 'work' };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(1);
      expect(result.map(t => t.id)).toEqual([1]);
    });

    it('filters by search term in description', () => {
      const filter: TaskFilter = { search: 'important' };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('filters by search term case insensitive', () => {
      const filter: TaskFilter = { search: 'PERSONAL' };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('combines multiple filters', () => {
      const filter: TaskFilter = {
        listId: 1,
        status: ['pending'],
        priority: [2],
      };
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('returns all tasks when no filters applied', () => {
      const filter: TaskFilter = {};
      const result = filterTasks(mockTasks, filter);

      expect(result).toHaveLength(3);
    });
  });

  describe('sortTasks', () => {
    it('sorts by name ascending', () => {
      const sort = { field: 'name', direction: 'asc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([3, 2, 1]);
    });

    it('sorts by name descending', () => {
      const sort = { field: 'name', direction: 'desc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('sorts by date ascending', () => {
      const sort = { field: 'date', direction: 'asc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('sorts by date descending', () => {
      const sort = { field: 'date', direction: 'desc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([3, 2, 1]);
    });

    it('sorts by deadline ascending', () => {
      const sort = { field: 'deadline', direction: 'asc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('sorts by priority ascending', () => {
      const sort = { field: 'priority', direction: 'asc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([3, 2, 1]);
    });

    it('sorts by priority descending', () => {
      const sort = { field: 'priority', direction: 'desc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('sorts by status ascending', () => {
      const sort = { field: 'status', direction: 'asc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([2, 1, 3]);
    });

    it('sorts by createdAt ascending', () => {
      const sort = { field: 'createdAt', direction: 'asc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('sorts by updatedAt ascending', () => {
      const sort = { field: 'updatedAt', direction: 'asc' as const };
      const result = sortTasks(mockTasks, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('handles tasks without dates (uses createdAt)', () => {
      const tasksWithoutDate = mockTasks.map(task => ({ ...task, date: undefined }));
      const sort = { field: 'date', direction: 'asc' as const };
      const result = sortTasks(tasksWithoutDate, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });

    it('handles tasks without deadlines (places at end)', () => {
      const tasksWithoutDeadline = mockTasks.map(task => ({ ...task, deadline: undefined }));
      const sort = { field: 'deadline', direction: 'asc' as const };
      const result = sortTasks(tasksWithoutDeadline, sort);

      expect(result.map(t => t.id)).toEqual([1, 2, 3]);
    });
  });
});