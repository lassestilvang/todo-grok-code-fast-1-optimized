import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { reminders, changeLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createReminderSchema = z.object({
  reminderTime: z.string().min(1, 'Reminder time is required'),
  message: z.string().optional(),
});

// GET /api/tasks/[id]/reminders - Get reminders for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const reminderList = await getDb()
      .select()
      .from(reminders)
      .where(eq(reminders.taskId, taskId));

    return NextResponse.json(reminderList);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/reminders - Create a new reminder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createReminderSchema.parse(body);

    const now = new Date();

    const newReminder = await getDb().insert(reminders).values({
      taskId,
      reminderTime: new Date(validatedData.reminderTime),
      message: validatedData.message,
      createdAt: now,
    }).returning();

    // Log the change
    await getDb().insert(changeLogs).values({
      entityType: 'reminder',
      entityId: newReminder[0].id,
      action: 'create',
      newValues: JSON.stringify(newReminder[0]),
      timestamp: now,
    });

    return NextResponse.json(newReminder[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}