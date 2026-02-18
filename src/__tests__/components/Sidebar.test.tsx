import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import { List, Label, Task } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Sidebar', () => {
  const mockTasks: Task[] = [
    { id: 1, name: 'Task 1', status: 'pending', priority: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, name: 'Task 2', status: 'completed', priority: 2, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  ];

  const mockLists: List[] = [
    { id: 1, name: 'Work', color: '#ff0000', emoji: '💼', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Personal', color: '#00ff00', emoji: '🏠', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockLabels: Label[] = [
    { id: 1, name: 'Urgent', color: '#ff0000', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Important', color: '#ffff00', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockOnViewChange = vi.fn();
  const mockOnListSelect = vi.fn();
  const mockOnLabelSelect = vi.fn();
  const mockOnToggleCompleted = vi.fn();

  const defaultProps = {
    tasks: mockTasks,
    lists: mockLists,
    labels: mockLabels,
    currentView: 'all',
    showCompleted: true,
    selectedListId: undefined,
    selectedLabelIds: [] as number[],
    onViewChange: mockOnViewChange,
    onListSelect: mockOnListSelect,
    onLabelSelect: mockOnLabelSelect,
    onToggleCompleted: mockOnToggleCompleted,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with views', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Task Management')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Next 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('All Tasks')).toBeInTheDocument();
  });

  it('calls onViewChange when view is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('today');
  });

  it('renders lists section', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Lists')).toBeInTheDocument();
    expect(screen.getByText('All Lists')).toBeInTheDocument();
  });

  it('calls onListSelect when list is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const workList = screen.getByText('Work');
    fireEvent.click(workList);

    expect(mockOnListSelect).toHaveBeenCalledWith(1);
  });

  it('calls onListSelect with undefined when All Lists is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const allLists = screen.getByText('All Lists');
    fireEvent.click(allLists);

    expect(mockOnListSelect).toHaveBeenCalledWith(undefined);
  });

  it('renders labels section', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('Important')).toBeInTheDocument();
  });

  it('calls onLabelSelect when label is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const urgentLabel = screen.getByText('Urgent');
    fireEvent.click(urgentLabel);

    expect(mockOnLabelSelect).toHaveBeenCalledWith([1]);
  });

  it('calls onToggleCompleted when toggle is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /show completed/i });
    fireEvent.click(toggleButton);

    expect(mockOnToggleCompleted).toHaveBeenCalled();
  });

  it('displays list counts', () => {
    render(<Sidebar {...defaultProps} />);

    // The count for each list should be visible
    const workList = screen.getByText('Work').closest('button');
    expect(workList).toBeInTheDocument();
  });

  it('handles empty lists', () => {
    render(<Sidebar {...defaultProps} lists={[]} />);

    expect(screen.getByText('All Lists')).toBeInTheDocument();
  });

  it('handles empty labels', () => {
    render(<Sidebar {...defaultProps} labels={[]} />);

    expect(screen.getByText('Labels')).toBeInTheDocument();
  });

  it('highlights selected list', () => {
    render(<Sidebar {...defaultProps} selectedListId={1} />);

    const workList = screen.getByText('Work').closest('button');
    expect(workList).toHaveClass('bg-indigo-50');
  });

  it('displays overdue count when tasks are overdue', () => {
    const overdueTasks: Task[] = [
      { id: 1, name: 'Overdue Task', status: 'pending', priority: 1, deadline: '2020-01-01', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ];

    render(<Sidebar {...defaultProps} tasks={overdueTasks} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });
});
