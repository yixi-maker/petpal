import { NextRequest, NextResponse } from 'next/server';
import { checkProviderHealth } from '@/lib/provider-health';

export const dynamic = 'force-dynamic';

function formatTable(statuses: Awaited<ReturnType<typeof checkProviderHealth>>): string {
  const lines: string[] = [];
  const header = 'Provider    Status      Stage        Message';
  const separator = '----------  ----------  -----------  ' + '-'.repeat(60);
  lines.push(header);
  lines.push(separator);
  for (const s of statuses) {
    const provider = s.provider.padEnd(12);
    const status = s.status.padEnd(12);
    const stage = s.stage.padEnd(13);
    lines.push(`${provider}${status}${stage}${s.message}`);
  }
  return lines.join('\n') + '\n';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const statuses = await checkProviderHealth();

  if (format === 'table') {
    return new NextResponse(formatTable(statuses), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return NextResponse.json({ status: statuses });
}
