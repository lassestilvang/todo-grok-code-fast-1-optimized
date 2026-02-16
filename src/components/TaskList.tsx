'use client';

import { useState } from 'react';

interface Task {
  id: number;
  name: string;
  description?: string;
  date?: string;
  deadline?: string;
  priority: number;
  status: string;
  estimateMinutes?: number;
  actualMinutes?: number;
  createdAt: string;
  updatedAt: string;
  list?: {
    id: number;
    name: string;
    color?: string;
  };
}

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange: (taskId: number, status: string) => void;
  onTaskDelete: (taskId: number) => void;
}

export default function TaskList({ tasks, onTaskClick, onTaskStatusChange, onTaskDelete }: TaskListProps) {
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0: return 'bg-gray-100 text-gray-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <div className="flex space-x-2">
          {['all', 'pending', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                {task.description && (
                  <p className="text-gray-600 mt-1">{task.description}</p>
                )}

                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                    {['Low', 'Medium', 'High'][task.priority]}
                  </span>

                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>

                  {task.list && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      {task.list.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  {task.date && (
                    <span>📅 {formatDate(task.date)}</span>
                  )}
                  {task.deadline && (
                    <span>⏰ {formatDate(task.deadline)}</span>
                  )}
                  {task.estimateMinutes && (
                    <span>⏱️ {task.estimateMinutes}min</span>
                  )}
                  {task.actualMinutes && (
                    <span>✅ {task.actualMinutes}min</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <select
                  value={task.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    onTaskStatusChange(task.id, e.target.value);
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this task?')) {
                      onTaskDelete(task.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        )}
      </div>
    </div>
  );
}