import { NextResponse } from 'next/server';
import { checkProviderHealth } from '@/lib/provider-health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkProviderHealth();
  return NextResponse.json({ status });
}
