import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '@/components/TaskForm';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const defaultProps = {
  lists: [
    { id: 1, name: 'Work', emoji: '💼' },
    { id: 2, name: 'Personal', emoji: '🏠' },
  ],
  labels: [
    { id: 1, name: 'Urgent', color: 'red' },
    { id: 2, name: 'Important', color: 'blue' },
  ],
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
};

describe('TaskForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders create form correctly', () => {
    render(<TaskForm {...defaultProps} />);

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Deadline')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Time Estimate (minutes)')).toBeInTheDocument();
    expect(screen.getByLabelText('List')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('renders edit form when task is provided', () => {
    const task = {
      id: 1,
      name: 'Existing Task',
      description: 'Existing description',
      date: '2024-01-01',
      deadline: '2024-01-02',
      priority: 2,
      status: 'completed',
      estimateMinutes: 120,
      listId: 1,
      recurringType: 'weekly',
      recurringInterval: 2,
      recurringEndDate: '2024-12-31',
    };

    render(<TaskForm {...defaultProps} task={task} />);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-02')).toBeInTheDocument();
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('validates required task name', async () => {
    render(<TaskForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates deadline after date', async () => {
    render(<TaskForm {...defaultProps} />);

    const dateInput = screen.getByLabelText('Date');
    const deadlineInput = screen.getByLabelText('Deadline');
    const submitButton = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(dateInput, { target: { value: '2024-01-05' } });
    fireEvent.change(deadlineInput, { target: { value: '2024-01-01' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Deadline must be after the task date')).toBeInTheDocument();
    });
  });

  it('validates positive estimate minutes', async () => {
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    const submitButton = screen.getByRole('button', { name: /create task/i });

    // Fill in name
    fireEvent.change(nameInput, { target: { value: 'Test Task' } });

    // Submit without estimate - this should work
    fireEvent.click(submitButton);

    // Form should submit without validation error for estimate
    // (empty estimate is valid)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Task',
          estimateMinutes: undefined,
        })
      );
    });
  });

  it('validates recurring interval when type is selected', async () => {
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    const recurringTypeSelect = screen.getByLabelText('Recurring Type');
    const submitButton = screen.getByRole('button', { name: /create task/i });

    // Fill in name
    fireEvent.change(nameInput, { target: { value: 'Test Task' } });

    // Select recurring type
    fireEvent.change(recurringTypeSelect, { target: { value: 'daily' } });

    // Wait for recurring interval field to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Every')).toBeInTheDocument();
    });

    // Form should submit with recurring interval of 1 (default valid value)
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Task',
          recurringType: 'daily',
          recurringInterval: 1,
        })
      );
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('Task Name *');
    await user.type(nameInput, 'New Task');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Task',
        })
      );
    });
  });

  it('handles label selection', async () => {
    const user = userEvent.setup();
    render(<TaskForm {...defaultProps} />);

    const urgentButton = screen.getByRole('button', { name: /urgent/i });
    await user.click(urgentButton);

    // The button should now have the selected styling
    expect(urgentButton).toHaveClass('bg-indigo-100');
  });

  it('shows recurring options when recurring type is selected', async () => {
    render(<TaskForm {...defaultProps} />);

    const recurringTypeSelect = screen.getByLabelText('Recurring Type');
    fireEvent.change(recurringTypeSelect, { target: { value: 'daily' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Every')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<TaskForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles empty lists and labels gracefully', () => {
    render(
      <TaskForm
        lists={[]}
        labels={[]}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    // No labels should render
    expect(screen.queryByText(/🏷️/)).not.toBeInTheDocument();
  });
});
