import { NextRequest, NextResponse } from 'next/server';
import { getSheetTitle } from '@/lib/googleSheets';

export async function GET(req: NextRequest) {
  try {
    const title = await getSheetTitle();
    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error fetching form title:', error);
    return NextResponse.json({ title: 'EventReg' }, { status: 500 });
  }
}
