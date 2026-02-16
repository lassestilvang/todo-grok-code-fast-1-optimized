import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import { List, Label, UiState } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Sidebar', () => {
  const mockLists: List[] = [
    { id: 1, name: 'Work', color: '#ff0000', emoji: '💼', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Personal', color: '#00ff00', emoji: '🏠', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockLabels: Label[] = [
    { id: 1, name: 'Urgent', color: '#ff0000', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Important', color: '#ffff00', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockUiState: UiState = {
    selectedTaskId: null,
    selectedListId: 1,
    taskFilter: {
      listId: 1,
      status: ['pending', 'in_progress'],
      priority: [1, 2],
    },
    taskSort: {
      field: 'createdAt',
      direction: 'desc',
    },
    viewMode: 'list',
    sidebarOpen: true,
    theme: 'light',
  };

  const mockOnFilterChange = vi.fn();
  const mockOnSortChange = vi.fn();
  const mockOnViewModeChange = vi.fn();
  const mockOnListSelect = vi.fn();
  const mockOnCreateList = vi.fn();
  const mockOnCreateLabel = vi.fn();

  const defaultProps = {
    lists: mockLists,
    labels: mockLabels,
    uiState: mockUiState,
    onFilterChange: mockOnFilterChange,
    onSortChange: mockOnSortChange,
    onViewModeChange: mockOnViewModeChange,
    onListSelect: mockOnListSelect,
    onCreateList: mockOnCreateList,
    onCreateLabel: mockOnCreateLabel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with lists and labels', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Lists')).toBeInTheDocument();
    expect(screen.getByText('💼 Work')).toBeInTheDocument();
    expect(screen.getByText('🏠 Personal')).toBeInTheDocument();
    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Urgent')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Important')).toBeInTheDocument();
  });

  it('highlights selected list', () => {
    render(<Sidebar {...defaultProps} />);

    const workList = screen.getByText('💼 Work').closest('div');
    expect(workList).toHaveClass('bg-indigo-100');
  });

  it('calls onListSelect when list is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const personalList = screen.getByText('🏠 Personal');
    fireEvent.click(personalList);

    expect(mockOnListSelect).toHaveBeenCalledWith(2);
  });

  it('shows all tasks option', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('All Tasks')).toBeInTheDocument();
  });

  it('calls onListSelect with null when all tasks is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const allTasks = screen.getByText('All Tasks');
    fireEvent.click(allTasks);

    expect(mockOnListSelect).toHaveBeenCalledWith(null);
  });

  it('renders filter section', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('displays status filter checkboxes', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByLabelText('Pending')).toBeChecked();
    expect(screen.getByLabelText('In Progress')).toBeChecked();
    expect(screen.getByLabelText('Completed')).not.toBeChecked();
    expect(screen.getByLabelText('Cancelled')).not.toBeChecked();
  });

  it('displays priority filter checkboxes', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByLabelText('Low')).not.toBeChecked();
    expect(screen.getByLabelText('Medium')).toBeChecked();
    expect(screen.getByLabelText('High')).toBeChecked();
  });

  it('calls onFilterChange when status filter is changed', () => {
    render(<Sidebar {...defaultProps} />);

    const completedCheckbox = screen.getByLabelText('Completed');
    fireEvent.click(completedCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockUiState.taskFilter,
      status: ['pending', 'in_progress', 'completed'],
    });
  });

  it('calls onFilterChange when priority filter is changed', () => {
    render(<Sidebar {...defaultProps} />);

    const lowCheckbox = screen.getByLabelText('Low');
    fireEvent.click(lowCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockUiState.taskFilter,
      priority: [0, 1, 2],
    });
  });

  it('renders sort section', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Sort')).toBeInTheDocument();
    expect(screen.getByDisplayValue('createdAt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('desc')).toBeInTheDocument();
  });

  it('calls onSortChange when sort field is changed', () => {
    render(<Sidebar {...defaultProps} />);

    const sortFieldSelect = screen.getByDisplayValue('createdAt');
    fireEvent.change(sortFieldSelect, { target: { value: 'name' } });

    expect(mockOnSortChange).toHaveBeenCalledWith({
      ...mockUiState.taskSort,
      field: 'name',
    });
  });

  it('calls onSortChange when sort direction is changed', () => {
    render(<Sidebar {...defaultProps} />);

    const sortDirectionSelect = screen.getByDisplayValue('desc');
    fireEvent.change(sortDirectionSelect, { target: { value: 'asc' } });

    expect(mockOnSortChange).toHaveBeenCalledWith({
      ...mockUiState.taskSort,
      direction: 'asc',
    });
  });

  it('renders view mode section', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByLabelText('List')).toBeChecked();
    expect(screen.getByLabelText('Board')).not.toBeChecked();
    expect(screen.getByLabelText('Calendar')).not.toBeChecked();
    expect(screen.getByLabelText('Timeline')).not.toBeChecked();
  });

  it('calls onViewModeChange when view mode is changed', () => {
    render(<Sidebar {...defaultProps} />);

    const boardRadio = screen.getByLabelText('Board');
    fireEvent.click(boardRadio);

    expect(mockOnViewModeChange).toHaveBeenCalledWith('board');
  });

  it('shows create list button', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Create List')).toBeInTheDocument();
  });

  it('calls onCreateList when create list button is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const createListButton = screen.getByText('Create List');
    fireEvent.click(createListButton);

    expect(mockOnCreateList).toHaveBeenCalled();
  });

  it('shows create label button', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Create Label')).toBeInTheDocument();
  });

  it('calls onCreateLabel when create label button is clicked', () => {
    render(<Sidebar {...defaultProps} />);

    const createLabelButton = screen.getByText('Create Label');
    fireEvent.click(createLabelButton);

    expect(mockOnCreateLabel).toHaveBeenCalled();
  });

  it('handles empty lists and labels', () => {
    render(<Sidebar {...defaultProps} lists={[]} labels={[]} />);

    expect(screen.getByText('No lists yet')).toBeInTheDocument();
    expect(screen.getByText('No labels yet')).toBeInTheDocument();
  });

  it('displays task counts for lists', () => {
    const listsWithTasks = [
      { ...mockLists[0], tasks: [{ id: 1 }] },
      { ...mockLists[1], tasks: [{ id: 2 }, { id: 3 }] },
    ];

    render(<Sidebar {...defaultProps} lists={listsWithTasks} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays task counts for labels', () => {
    const labelsWithTasks = [
      { ...mockLabels[0], tasks: [{ id: 1 }, { id: 2 }] },
      { ...mockLabels[1], tasks: [{ id: 3 }] },
    ];

    render(<Sidebar {...defaultProps} labels={labelsWithTasks} />);

    expect(screen.getAllByText('2')).toHaveLength(1);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles filter with no status selected', () => {
    const uiStateWithNoStatus = {
      ...mockUiState,
      taskFilter: {
        ...mockUiState.taskFilter,
        status: [],
      },
    };

    render(<Sidebar {...defaultProps} uiState={uiStateWithNoStatus} />);

    const pendingCheckbox = screen.getByLabelText('Pending');
    expect(pendingCheckbox).not.toBeChecked();
  });

  it('handles filter with no priority selected', () => {
    const uiStateWithNoPriority = {
      ...mockUiState,
      taskFilter: {
        ...mockUiState.taskFilter,
        priority: [],
      },
    };

    render(<Sidebar {...defaultProps} uiState={uiStateWithNoPriority} />);

    const lowCheckbox = screen.getByLabelText('Low');
    expect(lowCheckbox).not.toBeChecked();
  });
});