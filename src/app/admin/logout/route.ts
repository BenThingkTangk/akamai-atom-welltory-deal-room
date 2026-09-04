import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase/server';
import { originFromHeaders } from '@/lib/origin';

export async function POST(req: NextRequest) {
  const sb = getServerSupabase();
  await sb.auth.signOut();
  const base = originFromHeaders(headers());
  return NextResponse.redirect(new URL('/admin/login', base));
}
