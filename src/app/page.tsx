'use client';

import { useState, useEffect, useRef } from 'react';
import TaskList from '@/components/TaskList';
import TaskDetail from '@/components/TaskDetail';
import TaskForm from '@/components/TaskForm';

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

interface TaskFormData {
  name: string;
  description?: string;
  date?: string;
  deadline?: string;
  priority?: number;
  status?: string;
  estimateMinutes?: number;
  listId?: number;
  labelIds?: number[];
  recurringType?: string;
  recurringInterval?: number;
  recurringEndDate?: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimerSeconds, setCurrentTimerSeconds] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setCurrentTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const fetchTaskDetails = async (taskId: number) => {
    try {
      const [taskResponse, subtasksResponse, remindersResponse] = await Promise.all([
        fetch(`/api/tasks/${taskId}`),
        fetch(`/api/tasks/${taskId}/subtasks`),
        fetch(`/api/tasks/${taskId}/reminders`),
      ]);

      if (taskResponse.ok) {
        const task = await taskResponse.json();
        setSelectedTask(task);
      }

      if (subtasksResponse.ok) {
        const subtasksData = await subtasksResponse.json();
        setSubtasks(subtasksData);
      }

      if (remindersResponse.ok) {
        const remindersData = await remindersResponse.json();
        setReminders(remindersData);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    fetchTaskDetails(task.id);
  };

  const handleTaskStatusChange = async (taskId: number, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchTasks();
        if (selectedTask?.id === taskId) {
          fetchTaskDetails(taskId);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
        if (selectedTask?.id === taskId) {
          setSelectedTask(null);
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskUpdate = async (taskId: number, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchTasks();
        fetchTaskDetails(taskId);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskCreate = async (data: TaskFormData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchTasks();
        setShowTaskForm(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddSubtask = async (taskId: number, subtaskData: { name: string; description?: string }) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subtaskData),
      });

      if (response.ok) {
        fetchTaskDetails(taskId);
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleUpdateSubtask = async (subtaskId: number, updates: Partial<Subtask>) => {
    // For now, we'll implement this in the API later
    console.log('Update subtask:', subtaskId, updates);
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    // For now, we'll implement this in the API later
    console.log('Delete subtask:', subtaskId);
  };

  const handleAddReminder = async (taskId: number, reminderData: { reminderTime: string; message?: string }) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
      });

      if (response.ok) {
        fetchTaskDetails(taskId);
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setCurrentTimerSeconds(0);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    // Add the time to actual minutes
    if (selectedTask) {
      const additionalMinutes = Math.floor(currentTimerSeconds / 60);
      const newActualMinutes = (selectedTask.actualMinutes || 0) + additionalMinutes;
      handleTaskUpdate(selectedTask.id, { actualMinutes: newActualMinutes });
    }
    setCurrentTimerSeconds(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <button
            onClick={() => setShowTaskForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            + New Task
          </button>
        </div>

        <TaskList
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
        />

        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            subtasks={subtasks}
            reminders={reminders}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onAddSubtask={handleAddSubtask}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onAddReminder={handleAddReminder}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            isTimerRunning={isTimerRunning}
            currentTimerSeconds={currentTimerSeconds}
          />
        )}

        {showTaskForm && (
          <TaskForm
            onSubmit={handleTaskCreate}
            onCancel={() => setShowTaskForm(false)}
          />
        )}
      </div>
    </div>
  );
}