import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskDetail from '@/components/TaskDetail';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('TaskDetail', () => {
  const mockTask = {
    id: 1,
    name: 'Test Task',
    description: 'Test description',
    status: 'pending',
    priority: 1,
    date: '2024-01-01',
    deadline: '2024-01-02',
    estimateMinutes: 120,
    actualMinutes: 90,
    recurringType: 'daily',
    recurringInterval: 1,
    recurringEndDate: '2024-12-31',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockSubtasks = [
    { id: 1, name: 'Subtask 1', status: 'completed', order: 1 },
    { id: 2, name: 'Subtask 2', status: 'pending', order: 2 },
  ];

  const mockReminders = [
    { id: 1, reminderTime: '2024-01-01T10:00:00', message: 'Reminder message', isActive: true },
  ];

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnAddSubtask = vi.fn();
  const mockOnUpdateSubtask = vi.fn();
  const mockOnDeleteSubtask = vi.fn();
  const mockOnAddReminder = vi.fn();
  const mockOnStartTimer = vi.fn();
  const mockOnStopTimer = vi.fn();

  const defaultProps = {
    task: mockTask,
    subtasks: mockSubtasks,
    reminders: mockReminders,
    onClose: mockOnClose,
    onUpdate: mockOnUpdate,
    onAddSubtask: mockOnAddSubtask,
    onUpdateSubtask: mockOnUpdateSubtask,
    onDeleteSubtask: mockOnDeleteSubtask,
    onAddReminder: mockOnAddReminder,
    onStartTimer: mockOnStartTimer,
    onStopTimer: mockOnStopTimer,
    isTimerRunning: false,
    currentTimerSeconds: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task details correctly', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays priority and status', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByDisplayValue('Medium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
  });

  it('displays date and deadline', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-02')).toBeInTheDocument();
  });

  it('displays time estimates', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    expect(screen.getByDisplayValue('90')).toBeInTheDocument();
  });

  it('displays recurring information', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText(/every/i)).toBeInTheDocument();
  });

  it('displays subtasks', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
    expect(screen.getByText('Subtask 2')).toBeInTheDocument();
  });

  it('displays reminders', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText('Reminder message')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TaskDetail {...defaultProps} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onUpdate when priority is changed', () => {
    render(<TaskDetail {...defaultProps} />);

    const prioritySelect = screen.getByDisplayValue('Medium');
    fireEvent.change(prioritySelect, { target: { value: '2' } });

    expect(mockOnUpdate).toHaveBeenCalledWith(1, { priority: 2 });
  });

  it('calls onUpdate when status is changed', () => {
    render(<TaskDetail {...defaultProps} />);

    const statusSelect = screen.getByDisplayValue('Pending');
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    expect(mockOnUpdate).toHaveBeenCalledWith(1, { status: 'completed' });
  });

  it('handles task without optional fields', () => {
    const minimalTask = {
      id: 2,
      name: 'Minimal Task',
      status: 'pending',
      priority: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(<TaskDetail {...defaultProps} task={minimalTask} subtasks={[]} reminders={[]} />);

    expect(screen.getByText('Minimal Task')).toBeInTheDocument();
  });

  it('shows subtask progress', () => {
    render(<TaskDetail {...defaultProps} />);

    expect(screen.getByText(/of 2 completed/)).toBeInTheDocument();
  });

  it('allows adding a subtask', () => {
    render(<TaskDetail {...defaultProps} />);

    const input = screen.getByPlaceholderText('Add subtask');
    fireEvent.change(input, { target: { value: 'New subtask' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnAddSubtask).toHaveBeenCalledWith(1, { name: 'New subtask' });
  });

  it('allows toggling timer', () => {
    render(<TaskDetail {...defaultProps} />);

    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    expect(mockOnStartTimer).toHaveBeenCalledWith(1);
  });

  it('displays timer when running', () => {
    render(<TaskDetail {...defaultProps} isTimerRunning={true} currentTimerSeconds={3661} />);

    expect(screen.getByText('01:01:01')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });
});
