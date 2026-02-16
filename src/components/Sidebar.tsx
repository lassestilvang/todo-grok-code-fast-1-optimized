'use client';

import { useState, useEffect } from 'react';
import { List, Label, Task } from '@/lib/types';

interface SidebarProps {
  tasks: Task[];
  lists: List[];
  labels: Label[];
  currentView: string;
  showCompleted: boolean;
  selectedListId?: number;
  selectedLabelIds?: number[];
  onViewChange: (view: string) => void;
  onListSelect: (listId?: number) => void;
  onLabelSelect: (labelIds: number[]) => void;
  onToggleCompleted: () => void;
}

export default function Sidebar({
  tasks,
  lists,
  labels,
  currentView,
  showCompleted,
  selectedListId,
  selectedLabelIds = [],
  onViewChange,
  onListSelect,
  onLabelSelect,
  onToggleCompleted,
}: SidebarProps) {
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.deadline) return false;
      return new Date(task.deadline) < now;
    });
    setOverdueCount(overdueTasks.length);
  }, [tasks]);

  const getViewCounts = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const counts = {
      today: 0,
      next7days: 0,
      upcoming: 0,
      all: 0,
    };

    tasks.forEach(task => {
      if (!showCompleted && task.status === 'completed') {
        return;
      }

      counts.all++;

      if (!task.date) {
        return;
      }

      const taskDate = new Date(task.date);

      if (taskDate.toDateString() === today.toDateString()) {
        counts.today++;
      }
      if (taskDate >= today && taskDate <= nextWeek) {
        counts.next7days++;
      }
      if (taskDate > nextWeek) {
        counts.upcoming++;
      }
    });

    return counts;
  };

  const getListCounts = () => {
    const counts: Record<number, number> = {};
    lists.forEach(list => {
      counts[list.id] = tasks.filter(task =>
        task.listId === list.id &&
        (showCompleted || task.status !== 'completed')
      ).length;
    });
    return counts;
  };

  const getLabelCounts = () => {
    const counts: Record<number, number> = {};
    labels.forEach(label => {
      counts[label.id] = tasks.filter(task =>
        task.labels?.some(taskLabel => taskLabel.id === label.id) &&
        (showCompleted || task.status !== 'completed')
      ).length;
    });
    return counts;
  };

  const viewCounts = getViewCounts();
  const listCounts = getListCounts();
  const labelCounts = getLabelCounts();

  const handleLabelToggle = (labelId: number) => {
    const newSelectedLabels = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter(id => id !== labelId)
      : [...selectedLabelIds, labelId];
    onLabelSelect(newSelectedLabels);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Management</h2>

        {/* Views Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Views</h3>
          <nav className="space-y-1">
            <button
              onClick={() => onViewChange('today')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                currentView === 'today'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Today
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                viewCounts.today > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {viewCounts.today}
              </span>
            </button>

            <button
              onClick={() => onViewChange('next7days')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                currentView === 'next7days'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Next 7 Days
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                viewCounts.next7days > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {viewCounts.next7days}
              </span>
            </button>

            <button
              onClick={() => onViewChange('upcoming')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                currentView === 'upcoming'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upcoming
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                viewCounts.upcoming > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {viewCounts.upcoming}
              </span>
            </button>

            <button
              onClick={() => onViewChange('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                currentView === 'all'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                All Tasks
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                viewCounts.all > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {viewCounts.all}
              </span>
            </button>

            {/* Overdue Tasks */}
            {overdueCount > 0 && (
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm font-medium text-red-800">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Overdue
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {overdueCount}
                  </span>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Lists Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Lists</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onListSelect(undefined)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                selectedListId === undefined
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                All Lists
              </span>
            </button>

            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => onListSelect(list.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                  selectedListId === list.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-3 flex items-center justify-center text-sm">
                    {list.emoji || '📝'}
                  </span>
                  {list.name}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  listCounts[list.id] > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {listCounts[list.id]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Labels Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Labels</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <nav className="space-y-1">
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => handleLabelToggle(label.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                  selectedLabelIds.includes(label.id)
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-3 flex items-center justify-center">
                    🏷️
                  </span>
                  {label.name}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  labelCounts[label.id] > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {labelCounts[label.id]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Show Completed</span>
            <button
              onClick={onToggleCompleted}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                showCompleted ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showCompleted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}