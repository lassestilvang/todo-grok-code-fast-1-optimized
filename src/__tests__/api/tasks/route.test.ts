import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/tasks/route';
import { NextRequest } from 'next/server';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: vi.fn().mockReturnValue(data),
      status: options?.status || 200,
    })),
  },
}));

// Mock the database
vi.mock('@/lib/db', () => ({
  getDb: () => ({
    select: vi.fn(),
    insert: vi.fn(),
  }),
}));

// Mock drizzle-orm functions
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...conditions) => ({ conditions })),
  or: vi.fn((...conditions) => ({ conditions })),
  like: vi.fn((field, pattern) => ({ field, pattern })),
  desc: vi.fn((field) => ({ field, direction: 'desc' })),
  asc: vi.fn((field) => ({ field, direction: 'asc' })),
  orderBy: vi.fn((...fields) => ({ fields })),
  relations: vi.fn((table, callback) => ({ table, relations: callback })),
}));

describe('/api/tasks', () => {
  const mockRequest = (url: string, method = 'GET'): NextRequest => ({
    url,
    method,
    json: vi.fn(),
  } as NextRequest);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks with default pagination', async () => {
      const mockTasks = [
        { id: 1, name: 'Test Task', status: 'pending' },
        { id: 2, name: 'Another Task', status: 'completed' },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockTasks),
              }),
            }),
          }),
        }),
      });

      const { getDb } = await import('@/lib/db');
      getDb().select = mockSelect;

      const request = mockRequest('http://localhost:3000/api/tasks');
      const response = await GET(request as any);

      expect(mockSelect).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should filter tasks by status', async () => {
      const mockTasks = [{ id: 1, name: 'Pending Task', status: 'pending' }];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockTasks),
              }),
            }),
          }),
        }),
      });

      getDb().select = mockSelect;

      const request = mockRequest('http://localhost:3000/api/tasks?status=pending');
      const response = await GET(request);

      expect(response.json).toHaveBeenCalledWith(mockTasks);
    });

    it('should filter tasks by listId', async () => {
      const mockTasks = [{ id: 1, name: 'List Task', listId: 1 }];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockTasks),
              }),
            }),
          }),
        }),
      });

      getDb().select = mockSelect;

      const request = mockRequest('http://localhost:3000/api/tasks?listId=1');
      const response = await GET(request as any);

      expect(response.json()).toBe(mockTasks);
      expect(response.status).toBe(200);
    });

    it('should search tasks by name and description', async () => {
      const mockTasks = [{ id: 1, name: 'Search Result', description: 'Found' }];

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockTasks),
              }),
            }),
          }),
        }),
      });

      getDb().select = mockSelect;

      const request = mockRequest('http://localhost:3000/api/tasks?search=Search');
      const response = await GET(request);

      expect(response.json()).toBe(mockTasks);
    });

    it('should handle database errors', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockRejectedValue(new Error('Database error')),
              }),
            }),
          }),
        }),
      });

      getDb().select = mockSelect;

      const request = mockRequest('http://localhost:3000/api/tasks');
      const response = await GET(request as any);

      expect(response.status).toBe(500);
      expect(response.json()).toBe({ error: 'Failed to fetch tasks' });
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        name: 'New Task',
        description: 'Task description',
        priority: 1,
        status: 'pending',
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1, ...taskData }]),
        }),
      });

      getDb().insert = mockInsert;

      const request = mockRequest('http://localhost:3000/api/tasks', 'POST');
      request.json.mockResolvedValue(taskData);

      const response = await POST(request);

      expect(mockInsert).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.json).toHaveBeenCalledWith({ id: 1, ...taskData });
    });

    it('should validate required fields', async () => {
      const invalidData = { description: 'No name provided' };

      const request = mockRequest('http://localhost:3000/api/tasks', 'POST');
      request.json.mockResolvedValue(invalidData);

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(response.json()).toEqual({
        error: 'Validation failed',
        details: expect.any(Array),
      });
    });

    it('should handle database errors during creation', async () => {
      const taskData = { name: 'Test Task' };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      const { getDb } = await import('@/lib/db');
      getDb().insert = mockInsert;

      const request = mockRequest('http://localhost:3000/api/tasks', 'POST');
      request.json.mockResolvedValue(taskData);

      const response = await POST(request as any);

      expect(response.status).toBe(500);
      expect(response.json()).toEqual({ error: 'Failed to create task' });
    });
  });
});