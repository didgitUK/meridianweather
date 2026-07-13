import { getAdSensePublisherId } from '@/lib/server/adsense';

export async function GET() {
  const publisherId = getAdSensePublisherId();

  if (!publisherId) {
    return new Response('Not configured', { status: 404 });
  }

  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
