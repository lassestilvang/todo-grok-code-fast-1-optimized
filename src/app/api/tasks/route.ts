import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { tasks, changeLogs } from '@/lib/db/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const createTaskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  date: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.number().min(0).max(2).optional(),
  listId: z.number().optional(),
  estimateMinutes: z.number().optional(),
  recurringType: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurringInterval: z.number().min(1).optional(),
  recurringEndDate: z.string().optional(),
});


// GET /api/tasks - List tasks with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const listId = searchParams.get('listId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereConditions = [];

    if (status) {
      whereConditions.push(eq(tasks.status, status));
    }

    if (listId) {
      whereConditions.push(eq(tasks.listId, parseInt(listId)));
    }

    if (search) {
      whereConditions.push(
        or(
          like(tasks.name, `%${search}%`),
          like(tasks.description, `%${search}%`)
        )
      );
    }

    const taskList = await getDb()
      .select()
      .from(tasks)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(taskList);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const now = new Date();

    const newTask = await getDb().insert(tasks).values({
      ...validatedData,
      date: validatedData.date ? new Date(validatedData.date) : null,
      deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
      recurringEndDate: validatedData.recurringEndDate ? new Date(validatedData.recurringEndDate) : null,
      createdAt: now,
      updatedAt: now,
    }).returning();

    // Log the change
    await getDb().insert(changeLogs).values({
      entityType: 'task',
      entityId: newTask[0].id,
      action: 'create',
      newValues: JSON.stringify(newTask[0]),
      timestamp: now,
    });

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}