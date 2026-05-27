import { NextResponse } from 'next/server';
import { getMockPlaces } from '@/lib/mock-map';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || undefined;
  const type = searchParams.get('type') || undefined;

  try {
    const places = await getMockPlaces(city, type);
    return NextResponse.json({ places });
  } catch (error) {
    console.error('Failed to fetch places:', error);
    return NextResponse.json({ error: '获取地点列表失败' }, { status: 500 });
  }
}
