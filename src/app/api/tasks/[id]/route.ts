import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks, changeLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateTaskSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.number().min(0).max(2).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  listId: z.number().optional(),
  estimateMinutes: z.number().optional(),
  actualMinutes: z.number().optional(),
  recurringType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringInterval: z.number().min(1).optional(),
  recurringEndDate: z.string().optional(),
});

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (task.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Get the current task for logging
    const currentTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (currentTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const now = new Date();

    const updatedTask = await db
      .update(tasks)
      .set({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
        recurringEndDate: validatedData.recurringEndDate ? new Date(validatedData.recurringEndDate) : undefined,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    // Log the change
    await db.insert(changeLogs).values({
      entityType: 'task',
      entityId: taskId,
      action: 'update',
      oldValues: JSON.stringify(currentTask[0]),
      newValues: JSON.stringify(updatedTask[0]),
      timestamp: now,
    });

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    // Get the current task for logging
    const currentTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (currentTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    // Log the change
    await db.insert(changeLogs).values({
      entityType: 'task',
      entityId: taskId,
      action: 'delete',
      oldValues: JSON.stringify(currentTask[0]),
      timestamp: new Date(),
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}