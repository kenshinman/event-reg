import { getSheetTitle } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const title = await getSheetTitle();
    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error fetching form title:', error);
    return NextResponse.json({ title: 'EventReg' }, { status: 500 });
  }
}
