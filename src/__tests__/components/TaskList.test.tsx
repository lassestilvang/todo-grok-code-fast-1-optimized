import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import { TaskWithRelations } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('TaskList', () => {
  const mockTasks: TaskWithRelations[] = [
    {
      id: 1,
      name: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      list: { id: 1, name: 'Work', color: '#ff0000', emoji: '💼', createdAt: new Date(), updatedAt: new Date() },
      labels: [{ id: 1, name: 'Urgent', color: '#ff0000', createdAt: new Date(), updatedAt: new Date() }],
      subtasks: [],
      attachments: [],
      reminders: [],
    },
    {
      id: 2,
      name: 'Task 2',
      description: 'Description 2',
      status: 'completed',
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      list: null,
      labels: [],
      subtasks: [],
      attachments: [],
      reminders: [],
    },
  ];

  const mockOnTaskClick = vi.fn();
  const mockOnTaskUpdate = vi.fn();

  const defaultProps = {
    tasks: mockTasks,
    onTaskClick: mockOnTaskClick,
    onTaskUpdate: mockOnTaskUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task list correctly', () => {
    render(<TaskList {...defaultProps} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('displays task status correctly', () => {
    render(<TaskList {...defaultProps} />);

    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('displays task priority correctly', () => {
    render(<TaskList {...defaultProps} />);

    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('displays list information when available', () => {
    render(<TaskList {...defaultProps} />);

    expect(screen.getByText('💼 Work')).toBeInTheDocument();
  });

  it('displays labels when available', () => {
    render(<TaskList {...defaultProps} />);

    expect(screen.getByText('🏷️ Urgent')).toBeInTheDocument();
  });

  it('calls onTaskClick when task is clicked', () => {
    render(<TaskList {...defaultProps} />);

    const taskElement = screen.getByText('Task 1').closest('div');
    fireEvent.click(taskElement!);

    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('renders empty state when no tasks', () => {
    render(<TaskList {...defaultProps} tasks={[]} />);

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  it('displays subtask count when available', () => {
    const tasksWithSubtasks = [
      {
        ...mockTasks[0],
        subtasks: [
          { id: 1, taskId: 1, name: 'Subtask 1', status: 'pending', order: 1, createdAt: new Date(), updatedAt: new Date() },
          { id: 2, taskId: 1, name: 'Subtask 2', status: 'completed', order: 2, createdAt: new Date(), updatedAt: new Date() },
        ],
      },
    ];

    render(<TaskList {...defaultProps} tasks={tasksWithSubtasks} />);

    expect(screen.getByText('2 subtasks')).toBeInTheDocument();
  });

  it('displays attachment count when available', () => {
    const tasksWithAttachments = [
      {
        ...mockTasks[0],
        attachments: [
          { id: 1, taskId: 1, fileName: 'file1.pdf', filePath: '/path/file1.pdf', createdAt: new Date() },
          { id: 2, taskId: 1, fileName: 'file2.jpg', filePath: '/path/file2.jpg', createdAt: new Date() },
        ],
      },
    ];

    render(<TaskList {...defaultProps} tasks={tasksWithAttachments} />);

    expect(screen.getByText('2 attachments')).toBeInTheDocument();
  });

  it('displays reminder count when available', () => {
    const tasksWithReminders = [
      {
        ...mockTasks[0],
        reminders: [
          { id: 1, taskId: 1, reminderTime: new Date(), isActive: true, createdAt: new Date() },
          { id: 2, taskId: 1, reminderTime: new Date(), isActive: false, createdAt: new Date() },
        ],
      },
    ];

    render(<TaskList {...defaultProps} tasks={tasksWithReminders} />);

    expect(screen.getByText('2 reminders')).toBeInTheDocument();
  });

  it('displays due date when available', () => {
    const taskWithDeadline = {
      ...mockTasks[0],
      deadline: new Date('2024-12-31'),
    };

    render(<TaskList {...defaultProps} tasks={[taskWithDeadline]} />);

    expect(screen.getByText(/Due:/)).toBeInTheDocument();
  });

  it('shows overdue indicator for past due dates', () => {
    const overdueTask = {
      ...mockTasks[0],
      deadline: new Date('2020-01-01'),
    };

    render(<TaskList {...defaultProps} tasks={[overdueTask]} />);

    const dueElement = screen.getByText(/Due:/);
    expect(dueElement).toHaveClass('text-red-600');
  });

  it('displays time estimate when available', () => {
    const taskWithEstimate = {
      ...mockTasks[0],
      estimateMinutes: 120,
    };

    render(<TaskList {...defaultProps} tasks={[taskWithEstimate]} />);

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('displays actual time when available', () => {
    const taskWithActual = {
      ...mockTasks[0],
      actualMinutes: 90,
    };

    render(<TaskList {...defaultProps} tasks={[taskWithActual]} />);

    expect(screen.getByText('1.5h logged')).toBeInTheDocument();
  });
});