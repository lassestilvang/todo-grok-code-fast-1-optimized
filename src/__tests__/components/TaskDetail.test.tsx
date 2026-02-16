import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskDetail from '@/components/TaskDetail';
import { TaskWithRelations } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('TaskDetail', () => {
  const mockTask: TaskWithRelations = {
    id: 1,
    name: 'Test Task',
    description: 'Test description',
    status: 'pending',
    priority: 1,
    date: new Date('2024-01-01'),
    deadline: new Date('2024-01-02'),
    estimateMinutes: 120,
    actualMinutes: 90,
    recurringType: 'daily',
    recurringInterval: 1,
    recurringEndDate: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    list: { id: 1, name: 'Work', color: '#ff0000', emoji: '💼', createdAt: new Date(), updatedAt: new Date() },
    labels: [
      { id: 1, name: 'Urgent', color: '#ff0000', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Important', color: '#ffff00', createdAt: new Date(), updatedAt: new Date() },
    ],
    subtasks: [
      { id: 1, taskId: 1, name: 'Subtask 1', status: 'completed', order: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, taskId: 1, name: 'Subtask 2', status: 'pending', order: 2, createdAt: new Date(), updatedAt: new Date() },
    ],
    attachments: [
      { id: 1, taskId: 1, fileName: 'document.pdf', filePath: '/path/document.pdf', fileSize: 1024, mimeType: 'application/pdf', createdAt: new Date() },
    ],
    reminders: [
      { id: 1, taskId: 1, reminderTime: new Date('2024-01-01T10:00:00'), message: 'Reminder message', isActive: true, createdAt: new Date() },
    ],
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    task: mockTask,
    onClose: mockOnClose,
    onUpdate: mockOnUpdate,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task details correctly', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('💼 Work')).toBeInTheDocument();
  });

  it('displays date and deadline', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
  });

  it('displays time estimates and actual time', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('1.5h')).toBeInTheDocument();
  });

  it('displays recurring information', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Every 1 day')).toBeInTheDocument();
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
  });

  it('displays labels', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('🏷️ Urgent')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Important')).toBeInTheDocument();
  });

  it('displays subtasks with status', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('displays attachments', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
  });

  it('displays reminders', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Reminder message')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2024 at 10:00 AM')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TaskDetail {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onUpdate when edit button is clicked', () => {
    render(<TaskDetail {...defaultProps} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TaskDetail {...defaultProps} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('handles task without optional fields', () => {
    const minimalTask: TaskWithRelations = {
      id: 2,
      name: 'Minimal Task',
      status: 'pending',
      priority: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      list: null,
      labels: [],
      subtasks: [],
      attachments: [],
      reminders: [],
    };

    render(<TaskDetail {...defaultProps} task={minimalTask} />);

    expect(screen.getByText('Minimal Task')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.queryByText('No list')).toBeInTheDocument();
  });

  it('displays overdue deadline in red', () => {
    const overdueTask = {
      ...mockTask,
      deadline: new Date('2020-01-01'),
    };

    render(<TaskDetail {...defaultProps} task={overdueTask} />);

    const deadlineElement = screen.getByText('Jan 1, 2020');
    expect(deadlineElement).toHaveClass('text-red-600');
  });

  it('shows progress for subtasks', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  it('displays attachment file size correctly', () => {
    const taskWithLargeFile = {
      ...mockTask,
      attachments: [
        { id: 1, taskId: 1, fileName: 'large.pdf', filePath: '/path/large.pdf', fileSize: 1048576, mimeType: 'application/pdf', createdAt: new Date() },
      ],
    };

    render(<TaskDetail {...defaultProps} task={taskWithLargeFile} />);

    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('handles inactive reminders', () => {
    const taskWithInactiveReminder = {
      ...mockTask,
      reminders: [
        { id: 1, taskId: 1, reminderTime: new Date(), message: 'Inactive reminder', isActive: false, createdAt: new Date() },
      ],
    };

    render(<TaskDetail {...defaultProps} task={taskWithInactiveReminder} />);

    expect(screen.getByText('Inactive reminder')).toBeInTheDocument();
  });
});