import { buildLlmsFullTxt, llmsTextResponse } from '@/lib/llms';

export function GET() {
  return llmsTextResponse(buildLlmsFullTxt(), { maxAge: 3600 });
}
