import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, heardFrom } = await req.json();
    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return NextResponse.json({ error: 'First Name is required' }, { status: 400 });
    }
    if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
      return NextResponse.json({ error: 'Last Name is required' }, { status: 400 });
    }
    const date = new Date();
    const timestamp = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const values = [timestamp, firstName, lastName, email || '', phone || '', heardFrom || ''];
    await appendToSheet({ values, tabName: today });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Failed to register, please try again.' }, { status: 500 });
  }
}
