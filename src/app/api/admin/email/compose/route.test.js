import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/email/compose/route';

describe('POST /api/admin/email/compose', () => {
  it('rejects unauthenticated requests', async () => {
    const request = new NextRequest('http://localhost/api/admin/email/compose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'admin-reply-contact',
        to: 'someone@example.com',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
