import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subtasks, changeLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createSubtaskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  order: z.number().optional(),
});

const updateSubtaskSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  order: z.number().optional(),
});

// GET /api/tasks/[id]/subtasks - Get subtasks for a task
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

    const subtaskList = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId))
      .orderBy(subtasks.order);

    return NextResponse.json(subtaskList);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/subtasks - Create a new subtask
export async function POST(
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
    const validatedData = createSubtaskSchema.parse(body);

    const now = new Date();

    const newSubtask = await db.insert(subtasks).values({
      ...validatedData,
      taskId,
      createdAt: now,
      updatedAt: now,
    }).returning();

    // Log the change
    await db.insert(changeLogs).values({
      entityType: 'subtask',
      entityId: newSubtask[0].id,
      action: 'create',
      newValues: JSON.stringify(newSubtask[0]),
      timestamp: now,
    });

    return NextResponse.json(newSubtask[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    );
  }
}