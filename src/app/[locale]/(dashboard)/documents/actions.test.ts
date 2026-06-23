import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerDocumentAction } from './actions';
import { prisma } from '@/lib/db/prisma';
import { fetchUploadThingFile } from '@/lib/storage/server';

vi.mock('@/lib/storage/server', () => ({
  fetchUploadThingFile: vi.fn(),
}));

// unstable_after is already mocked in setup, but we don't want tests to hang on processDocument
// Let's mock extractTextFromFile and AI services if processDocument is going to run.
vi.mock('@/lib/files/extract-text', () => ({
  extractTextFromFile: vi.fn().mockResolvedValue('Extracted dummy text with sufficient length for testing'),
}));
vi.mock('@/lib/ai/services/classify-document', () => ({
  classifyDocumentService: vi.fn().mockResolvedValue({ category: 'ID_PROOF', confidence: 0.99, issuingAuthority: 'Test Auth' }),
}));
vi.mock('@/lib/ai/services/extract-document', () => ({
  extractDocumentService: vi.fn().mockResolvedValue({ documentNumberMasked: '***1234' }),
}));

describe('registerDocumentAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return RATE_LIMITED if rate limit fails', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit/redis');
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ success: false, limit: 10, remaining: 0, reset: 0 });

    const res = await registerDocumentAction({
      uploadThingKey: 'key_123',
      fileName: 'test.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('RATE_LIMITED');
  });

  it('should return DEDUPED if file already exists', async () => {
    vi.mocked(fetchUploadThingFile).mockResolvedValue(Buffer.from('dummy file content'));
    vi.mocked(prisma.document.findFirst).mockResolvedValue({ id: 'existing_doc_id' } as any);

    const res = await registerDocumentAction({
      uploadThingKey: 'key_123',
      fileName: 'test.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.status).toBe('DEDUPED');
      expect(res.data.documentId).toBe('existing_doc_id');
    }
  });

  it('should create document and schedule processing if valid and new', async () => {
    vi.mocked(fetchUploadThingFile).mockResolvedValue(Buffer.from('new file content'));
    vi.mocked(prisma.document.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.document.create).mockResolvedValue({ id: 'new_doc_id' } as any);
    // Mock the findUniqueOrThrow that processDocument will call
    vi.mocked(prisma.document.findUniqueOrThrow).mockResolvedValue({
      id: 'new_doc_id',
      userId: 'user_123',
      mimeType: 'application/pdf'
    } as any);

    const res = await registerDocumentAction({
      uploadThingKey: 'key_123',
      fileName: 'test.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.status).toBe('PROCESSING');
      expect(res.data.documentId).toBe('new_doc_id');
    }

    expect(prisma.document.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        fileName: 'test.pdf',
        status: 'PROCESSING',
      })
    }));
  });
});
