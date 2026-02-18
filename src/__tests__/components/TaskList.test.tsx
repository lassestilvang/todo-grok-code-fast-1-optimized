import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '@/components/TaskList';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('TaskList', () => {
  const mockTasks = [
    {
      id: 1,
      name: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      priority: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 2,
      name: 'Task 2',
      description: 'Description 2',
      status: 'completed',
      priority: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockOnTaskClick = vi.fn();
  const mockOnTaskStatusChange = vi.fn();
  const mockOnTaskDelete = vi.fn();

  const defaultProps = {
    tasks: mockTasks,
    onTaskClick: mockOnTaskClick,
    onTaskStatusChange: mockOnTaskStatusChange,
    onTaskDelete: mockOnTaskDelete,
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

  it('filters tasks by status', () => {
    render(<TaskList {...defaultProps} />);

    const pendingButton = screen.getByText('PENDING');
    fireEvent.click(pendingButton);

    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
  });

  it('displays date when available', () => {
    const taskWithDate = {
      ...mockTasks[0],
      date: '2024-12-31',
    };

    render(<TaskList {...defaultProps} tasks={[taskWithDate]} />);

    expect(screen.getByText(/📅/)).toBeInTheDocument();
  });

  it('displays deadline when available', () => {
    const taskWithDeadline = {
      ...mockTasks[0],
      deadline: '2024-12-31',
    };

    render(<TaskList {...defaultProps} tasks={[taskWithDeadline]} />);

    expect(screen.getByText(/⏰/)).toBeInTheDocument();
  });

  it('displays time estimate when available', () => {
    const taskWithEstimate = {
      ...mockTasks[0],
      estimateMinutes: 120,
    };

    render(<TaskList {...defaultProps} tasks={[taskWithEstimate]} />);

    expect(screen.getByText(/⏱️/)).toBeInTheDocument();
  });

  it('displays actual time when available', () => {
    const taskWithActual = {
      ...mockTasks[0],
      actualMinutes: 90,
    };

    render(<TaskList {...defaultProps} tasks={[taskWithActual]} />);

    expect(screen.getByText(/✅/)).toBeInTheDocument();
  });

  it('calls onTaskStatusChange when status is changed', () => {
    render(<TaskList {...defaultProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'completed' } });

    expect(mockOnTaskStatusChange).toHaveBeenCalledWith(1, 'completed');
  });
});
