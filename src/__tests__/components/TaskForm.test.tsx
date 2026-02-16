import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '@/components/TaskForm';
import { List, Label } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('TaskForm', () => {
  const mockLists: List[] = [
    { id: 1, name: 'Work', color: '#ff0000', emoji: '💼', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Personal', color: '#00ff00', emoji: '🏠', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockLabels: Label[] = [
    { id: 1, name: 'Urgent', color: '#ff0000', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Important', color: '#ffff00', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    lists: mockLists,
    labels: mockLabels,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(<TaskForm {...defaultProps} />);

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('renders edit form when task is provided', () => {
    const existingTask = {
      id: 1,
      name: 'Existing Task',
      description: 'Existing description',
      priority: 2,
      status: 'completed',
      date: '2024-01-01',
      deadline: '2024-01-02',
      estimateMinutes: 120,
      listId: 1,
      labels: [mockLabels[0]],
    };

    render(<TaskForm {...defaultProps} task={existingTask} />);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('validates required task name', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(screen.getByText('Task name is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates deadline after date', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    const dateInput = screen.getByLabelText('Date');
    const deadlineInput = screen.getByLabelText('Deadline');

    await user.type(nameInput, 'Test Task');
    await user.type(dateInput, '2024-01-02');
    await user.type(deadlineInput, '2024-01-01');

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(screen.getByText('Deadline must be after the task date')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates positive estimate minutes', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    const estimateInput = screen.getByLabelText('Time Estimate (minutes)');

    await user.type(nameInput, 'Test Task');
    await user.type(estimateInput, '-10');

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(screen.getByText('Estimate must be positive')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates recurring interval', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    const recurringTypeSelect = screen.getByLabelText('Recurring Type');
    const recurringIntervalInput = screen.getByLabelText('Every');

    await user.type(nameInput, 'Test Task');
    await user.selectOptions(recurringTypeSelect, 'daily');
    await user.clear(recurringIntervalInput);
    await user.type(recurringIntervalInput, '0');

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(screen.getByText('Interval must be at least 1')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    const descriptionTextarea = screen.getByLabelText('Description');
    const prioritySelect = screen.getByLabelText('Priority');
    const statusSelect = screen.getByLabelText('Status');
    const dateInput = screen.getByLabelText('Date');
    const deadlineInput = screen.getByLabelText('Deadline');
    const estimateInput = screen.getByLabelText('Time Estimate (minutes)');
    const listSelect = screen.getByLabelText('List');

    await user.type(nameInput, 'New Task');
    await user.type(descriptionTextarea, 'Task description');
    await user.selectOptions(prioritySelect, '2');
    await user.selectOptions(statusSelect, 'in_progress');
    await user.type(dateInput, '2024-01-01');
    await user.type(deadlineInput, '2024-01-02');
    await user.type(estimateInput, '120');
    await user.selectOptions(listSelect, '1');

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'New Task',
      description: 'Task description',
      priority: 2,
      status: 'in_progress',
      date: '2024-01-01',
      deadline: '2024-01-02',
      estimateMinutes: 120,
      listId: 1,
      recurringType: undefined,
      recurringInterval: undefined,
      recurringEndDate: undefined,
      labelIds: [],
    });
  });

  it('handles label selection', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    await user.type(nameInput, 'Test Task');

    const urgentLabel = screen.getByText('🏷️ Urgent');
    await user.click(urgentLabel);

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        labelIds: [1],
      })
    );
  });

  it('shows recurring options when recurring type is selected', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const recurringTypeSelect = screen.getByLabelText('Recurring Type');
    await user.selectOptions(recurringTypeSelect, 'weekly');

    expect(screen.getByLabelText('Every')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('populates form with existing task data', () => {
    const existingTask = {
      id: 1,
      name: 'Existing Task',
      description: 'Existing description',
      priority: 2,
      status: 'completed',
      date: '2024-01-01',
      deadline: '2024-01-02',
      estimateMinutes: 120,
      listId: 1,
      labels: [mockLabels[0]],
      recurringType: 'weekly',
      recurringInterval: 2,
      recurringEndDate: '2024-12-31',
    };

    render(<TaskForm {...defaultProps} task={existingTask} />);

    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('completed')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-02')).toBeInTheDocument();
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('weekly')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
  });

  it('handles form submission with recurring data', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    const recurringTypeSelect = screen.getByLabelText('Recurring Type');
    const recurringIntervalInput = screen.getByLabelText('Every');
    const recurringEndDateInput = screen.getByLabelText('End Date');

    await user.type(nameInput, 'Recurring Task');
    await user.selectOptions(recurringTypeSelect, 'monthly');
    await user.clear(recurringIntervalInput);
    await user.type(recurringIntervalInput, '3');
    await user.type(recurringEndDateInput, '2024-12-31');

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Recurring Task',
        recurringType: 'monthly',
        recurringInterval: 3,
        recurringEndDate: '2024-12-31',
      })
    );
  });

  it('handles empty lists and labels gracefully', () => {
    render(<TaskForm {...defaultProps} lists={[]} labels={[]} />);

    expect(screen.getByText('No List')).toBeInTheDocument();
    expect(screen.queryByText('🏷️')).not.toBeInTheDocument();
  });

  it('clears validation errors when input changes', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(screen.getByText('Task name is required')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Task Name *');
    await user.type(nameInput, 'Test Task');

    expect(screen.queryByText('Task name is required')).not.toBeInTheDocument();
  });
});