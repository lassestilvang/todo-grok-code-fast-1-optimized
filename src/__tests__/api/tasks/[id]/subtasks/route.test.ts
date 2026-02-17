import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/tasks/[id]/subtasks/route';

// Mock drizzle-orm functions
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

describe('/api/tasks/[id]/subtasks', () => {
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

  describe('GET /api/tasks/[id]/subtasks', () => {
    it('should return subtasks for a task', async () => {
      const mockSubtasks = [
        { id: 1, taskId: 1, name: 'Subtask 1', status: 'pending', order: 1 },
        { id: 2, taskId: 1, name: 'Subtask 2', status: 'completed', order: 2 },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockSubtasks),
          }),
        }),
      });

      const { db } = await import('@/lib/db');
      db.select = mockSelect;

      const request = mockRequest('GET');
      const response = await GET(request as any, { params: mockParams });

      expect(mockSelect).toHaveBeenCalled();
      expect(response.json()).toEqual(mockSubtasks);
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
      expect(response.json()).toEqual({ error: 'Failed to fetch subtasks' });
    });
  });

  describe('POST /api/tasks/[id]/subtasks', () => {
    it('should create a new subtask successfully', async () => {
      const subtaskData = {
        name: 'New Subtask',
        description: 'Subtask description',
        status: 'pending',
        order: 1,
      };

      const mockSubtask = {
        id: 1,
        taskId: 1,
        ...subtaskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSubtask]),
        }),
      });

      const { db } = await import('@/lib/db');
      db.insert = mockInsert;

      const request = mockRequest('POST');
      request.json.mockResolvedValue(subtaskData);

      const response = await POST(request as any, { params: mockParams });

      expect(mockInsert).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.json()).toEqual(mockSubtask);
    });

    it('should return 400 for invalid task id', async () => {
      const subtaskData = { name: 'Test Subtask' };

      const request = mockRequest('POST');
      request.json.mockResolvedValue(subtaskData);

      const response = await POST(request as any, { params: { id: 'invalid' } });

      expect(response.status).toBe(400);
      expect(response.json()).toEqual({ error: 'Invalid task ID' });
    });

    it('should validate required fields', async () => {
      const invalidData = { description: 'No name provided' };

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
      const subtaskData = { name: 'Test Subtask' };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      db.insert = mockInsert;

      const request = mockRequest('POST');
      request.json.mockResolvedValue(subtaskData);

      const response = await POST(request as any, { params: mockParams });

      expect(response.status).toBe(500);
      expect(response.json()).toEqual({ error: 'Failed to create subtask' });
    });
  });
});