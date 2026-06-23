import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerAction } from './actions';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';

// Mock bcrypt to speed up tests
vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password_123'),
}));

describe('registerAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return VALIDATION error for weak password', async () => {
    const res = await registerAction({ name: 'Test', email: 'test@test.com', password: '123' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('VALIDATION');
  });

  it('should return CONFLICT error if email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1' } as any);
    
    const res = await registerAction({
      name: 'Test',
      email: 'exists@test.com',
      password: 'Password123!'
    });
    
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('CONFLICT');
  });

  it('should create user and return success on valid input', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'new_user' } as any);
    
    const res = await registerAction({
      name: 'Test User',
      email: 'new@test.com',
      password: 'Password123!'
    });
    
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'new@test.com',
        passwordHash: 'hashed_password_123',
      }
    });
    expect(res.ok).toBe(true);
  });
});
