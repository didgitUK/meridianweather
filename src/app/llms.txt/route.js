import { buildLlmsTxt, llmsTextResponse } from '@/lib/llms';

export function GET() {
  return llmsTextResponse(buildLlmsTxt());
}
