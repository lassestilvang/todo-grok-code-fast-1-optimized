import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/tasks/[id]/reminders/route';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

// Mock drizzle-orm functions
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

describe('/api/tasks/[id]/reminders', () => {
  const mockRequest = (method = 'GET') => ({
    method,
    json: vi.fn(),
  });

  const mockResponse = () => ({
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  });

  const mockParams = { id: '1' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/tasks/[id]/reminders', () => {
    it('should return reminders for a task', async () => {
      const mockReminders = [
        { id: 1, taskId: 1, reminderTime: new Date(), message: 'Test reminder' },
        { id: 2, taskId: 1, reminderTime: new Date(), message: 'Another reminder' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockReminders),
        }),
      });

      db.select = mockSelect;

      const request = mockRequest('GET');
      const response = await GET(request as any, { params: mockParams });

      expect(mockSelect).toHaveBeenCalled();
      expect(response.json()).toEqual(mockReminders);
      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid task id', async () => {
      const request = mockRequest('GET');
      const response = await GET(request as any, { params: { id: 'invalid' } });

      expect(response.status).toBe(400);
      expect(response.json()).toEqual({ error: 'Invalid task ID' });
    });

    it('should handle database errors', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      db.select = mockSelect;

      const request = mockRequest('GET');
      const response = await GET(request as any, { params: mockParams });

      expect(response.status).toBe(500);
      expect(response.json()).toEqual({ error: 'Failed to fetch reminders' });
    });
  });

  describe('POST /api/tasks/[id]/reminders', () => {
    it('should create a new reminder successfully', async () => {
      const reminderData = {
        reminderTime: '2024-01-01T10:00:00Z',
        message: 'Test reminder message',
      };

      const mockReminder = {
        id: 1,
        taskId: 1,
        reminderTime: new Date(reminderData.reminderTime),
        message: reminderData.message,
        createdAt: new Date(),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockReminder]),
        }),
      });

      db.insert = mockInsert;

      const request = mockRequest('POST');
      request.json.mockResolvedValue(reminderData);

      const response = await POST(request as any, { params: mockParams });

      expect(mockInsert).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.json()).toEqual(mockReminder);
    });

    it('should return 400 for invalid task id', async () => {
      const reminderData = { reminderTime: '2024-01-01T10:00:00Z' };

      const request = mockRequest('POST');
      request.json.mockResolvedValue(reminderData);

      const response = await POST(request as any, { params: { id: 'invalid' } });

      expect(response.status).toBe(400);
      expect(response.json()).toEqual({ error: 'Invalid task ID' });
    });

    it('should validate required fields', async () => {
      const invalidData = { message: 'No reminder time' };

      const request = mockRequest('POST');
      request.json.mockResolvedValue(invalidData);

      const response = await POST(request as any, { params: mockParams });

      expect(response.status).toBe(400);
      expect(response.json()).toEqual({
        error: 'Validation failed',
        details: expect.any(Array),
      });
    });

    it('should handle database errors during creation', async () => {
      const reminderData = { reminderTime: '2024-01-01T10:00:00Z' };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      db.insert = mockInsert;

      const request = mockRequest('POST');
      request.json.mockResolvedValue(reminderData);

      const response = await POST(request as any, { params: mockParams });

      expect(response.status).toBe(500);
      expect(response.json()).toEqual({ error: 'Failed to create reminder' });
    });
  });
});