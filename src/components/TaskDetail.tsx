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
  recurringType?: string;
  recurringInterval?: number;
  recurringEndDate?: string;
  createdAt: string;
  updatedAt: string;
  list?: {
    id: number;
    name: string;
    color?: string;
  };
}

interface Subtask {
  id: number;
  name: string;
  description?: string;
  status: string;
  order: number;
}

interface Reminder {
  id: number;
  reminderTime: string;
  message?: string;
  isActive: boolean;
}

interface TaskDetailProps {
  task: Task;
  subtasks: Subtask[];
  reminders: Reminder[];
  onClose: () => void;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
  onAddSubtask: (taskId: number, subtask: { name: string; description?: string }) => void;
  onUpdateSubtask: (subtaskId: number, updates: Partial<Subtask>) => void;
  onDeleteSubtask: (subtaskId: number) => void;
  onAddReminder: (taskId: number, reminder: { reminderTime: string; message?: string }) => void;
  onStartTimer: (taskId: number) => void;
  onStopTimer: (taskId: number) => void;
  isTimerRunning: boolean;
  currentTimerSeconds: number;
}

export default function TaskDetail({
  task,
  subtasks,
  reminders,
  onClose,
  onUpdate,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onAddReminder,
  onStartTimer,
  onStopTimer,
  isTimerRunning,
  currentTimerSeconds,
}: TaskDetailProps) {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderMessage, setNewReminderMessage] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFieldEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleFieldSave = (field: string) => {
    if (field === 'name') {
      onUpdate(task.id, { name: editValue });
    } else if (field === 'description') {
      onUpdate(task.id, { description: editValue });
    }
    setEditingField(null);
  };

  const handleAddSubtask = () => {
    if (newSubtaskName.trim()) {
      onAddSubtask(task.id, { name: newSubtaskName });
      setNewSubtaskName('');
    }
  };

  const handleAddReminder = () => {
    if (newReminderTime) {
      onAddReminder(task.id, {
        reminderTime: newReminderTime,
        message: newReminderMessage || undefined,
      });
      setNewReminderTime('');
      setNewReminderMessage('');
    }
  };

  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
  const progressPercentage = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {editingField === 'name' ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFieldSave('name');
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                  />
                  <button
                    onClick={() => handleFieldSave('name')}
                    className="text-green-600 hover:text-green-800"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <h1
                  className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600"
                  onClick={() => handleFieldEdit('name', task.name)}
                >
                  {task.name}
                </h1>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {editingField === 'description' ? (
                  <div className="space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFieldSave('description')}
                        className="text-green-600 hover:text-green-800"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-gray-600 cursor-pointer hover:text-indigo-600"
                    onClick={() => handleFieldEdit('description', task.description || '')}
                  >
                    {task.description || 'No description'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) => onUpdate(task.id, { priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value={0}>Low</option>
                    <option value={1}>Medium</option>
                    <option value={2}>High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => onUpdate(task.id, { status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={task.date ? new Date(task.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => onUpdate(task.id, { date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => onUpdate(task.id, { deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="number"
                    value={task.estimateMinutes || 0}
                    onChange={(e) => onUpdate(task.id, { estimateMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Time
                  </label>
                  <input
                    type="number"
                    value={task.actualMinutes || 0}
                    onChange={(e) => onUpdate(task.id, { actualMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>

              {task.recurringType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurring
                  </label>
                  <p className="text-gray-600">
                    Every {task.recurringInterval} {task.recurringType}
                    {task.recurringEndDate && ` until ${formatDate(task.recurringEndDate)}`}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Tracking
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-mono">{formatTime(currentTimerSeconds)}</span>
                  <button
                    onClick={() => isTimerRunning ? onStopTimer(task.id) : onStartTimer(task.id)}
                    className={`px-4 py-2 rounded-md ${
                      isTimerRunning
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isTimerRunning ? 'Stop' : 'Start'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Subtasks</h3>
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {completedSubtasks} of {subtasks.length} completed
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={subtask.status === 'completed'}
                        onChange={(e) => onUpdateSubtask(subtask.id, {
                          status: e.target.checked ? 'completed' : 'pending'
                        })}
                        className="rounded"
                      />
                      <span className={subtask.status === 'completed' ? 'line-through text-gray-500' : ''}>
                        {subtask.name}
                      </span>
                      <button
                        onClick={() => onDeleteSubtask(subtask.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    placeholder="Add subtask"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubtask();
                    }}
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reminders</h3>
                <div className="space-y-2 mb-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(reminder.reminderTime).toLocaleString()}
                        </p>
                        {reminder.message && (
                          <p className="text-sm text-gray-600">{reminder.message}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        reminder.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reminder.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={newReminderMessage}
                    onChange={(e) => setNewReminderMessage(e.target.value)}
                    placeholder="Reminder message (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleAddReminder}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}