'use client';

import { useState, useEffect } from 'react';
import { List, Label, Priority, TaskStatus, RecurringType } from '@/lib/types';

interface TaskFormProps {
  task?: {
    id: number;
    name: string;
    description?: string;
    date?: string;
    deadline?: string;
    priority: number;
    status: string;
    estimateMinutes?: number;
    actualMinutes?: number;
    recurringType?: string;
    recurringInterval?: number;
    recurringEndDate?: string;
    listId?: number;
    labels?: Label[];
  };
  lists: List[];
  labels: Label[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  existingTasks?: any[]; // For smart suggestions
}

export default function TaskForm({ task, lists = [], labels = [], onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    deadline: '',
    priority: 1 as Priority,
    status: 'pending' as TaskStatus,
    estimateMinutes: '',
    listId: '',
    labelIds: [] as number[],
    recurringType: '' as RecurringType | '',
    recurringInterval: 1,
    recurringEndDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        date: task.date ? new Date(task.date).toISOString().split('T')[0] : '',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        priority: task.priority as Priority,
        status: task.status as TaskStatus,
        estimateMinutes: task.estimateMinutes?.toString() || '',
        listId: task.listId?.toString() || '',
        labelIds: task.labels?.map(label => label.id) || [],
        recurringType: task.recurringType as RecurringType || '',
        recurringInterval: task.recurringInterval || 1,
        recurringEndDate: task.recurringEndDate ? new Date(task.recurringEndDate).toISOString().split('T')[0] : '',
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (formData.date && formData.deadline) {
      const taskDate = new Date(formData.date);
      const deadlineDate = new Date(formData.deadline);
      if (taskDate > deadlineDate) {
        newErrors.deadline = 'Deadline must be after the task date';
      }
    }

    if (formData.estimateMinutes && parseInt(formData.estimateMinutes) < 0) {
      newErrors.estimateMinutes = 'Estimate must be positive';
    }

    if (formData.recurringType && formData.recurringInterval < 1) {
      newErrors.recurringInterval = 'Interval must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      date: formData.date || undefined,
      deadline: formData.deadline || undefined,
      estimateMinutes: formData.estimateMinutes ? parseInt(formData.estimateMinutes) : undefined,
      listId: formData.listId ? parseInt(formData.listId) : undefined,
      recurringType: formData.recurringType || undefined,
      recurringInterval: formData.recurringType ? formData.recurringInterval : undefined,
      recurringEndDate: formData.recurringEndDate || undefined,
    };

    onSubmit(submitData);
  };

  const handleLabelToggle = (labelId: number) => {
    setFormData(prev => ({
      ...prev,
      labelIds: prev.labelIds.includes(labelId)
        ? prev.labelIds.filter(id => id !== labelId)
        : [...prev.labelIds, labelId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Task Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter task name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.deadline ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) as Priority }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>Low</option>
                  <option value={1}>Medium</option>
                  <option value={2}>High</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Estimate Minutes */}
            <div>
              <label htmlFor="estimateMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                Time Estimate (minutes)
              </label>
              <input
                type="number"
                id="estimateMinutes"
                value={formData.estimateMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimateMinutes: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.estimateMinutes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter estimated time in minutes"
                min="0"
              />
              {errors.estimateMinutes && <p className="mt-1 text-sm text-red-600">{errors.estimateMinutes}</p>}
            </div>

            {/* List */}
            <div>
              <label htmlFor="listId" className="block text-sm font-medium text-gray-700 mb-1">
                List
              </label>
              <select
                id="listId"
                value={formData.listId}
                onChange={(e) => setFormData(prev => ({ ...prev, listId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No List</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.emoji} {list.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => handleLabelToggle(label.id)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      formData.labelIds.includes(label.id)
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏷️ {label.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recurring Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="recurringType" className="block text-sm font-medium text-gray-700 mb-1">
                    Recurring Type
                  </label>
                  <select
                    id="recurringType"
                    value={formData.recurringType}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurringType: e.target.value as RecurringType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Not Recurring</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {formData.recurringType && (
                  <>
                    <div>
                      <label htmlFor="recurringInterval" className="block text-sm font-medium text-gray-700 mb-1">
                        Every
                      </label>
                      <input
                        type="number"
                        id="recurringInterval"
                        value={formData.recurringInterval}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurringInterval: parseInt(e.target.value) || 1 }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.recurringInterval ? 'border-red-300' : 'border-gray-300'
                        }`}
                        min="1"
                      />
                      {errors.recurringInterval && <p className="mt-1 text-sm text-red-600">{errors.recurringInterval}</p>}
                    </div>

                    <div>
                      <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="recurringEndDate"
                        value={formData.recurringEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}