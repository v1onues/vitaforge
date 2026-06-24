import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { supabaseUrl, supabaseAnonKey, syncId } = await request.json();
    if (!supabaseUrl || !supabaseAnonKey || !syncId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('sync_data')
      .select('encrypted_data, updated_at')
      .eq('id', syncId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ encryptedData: data.encrypted_data, updatedAt: data.updated_at });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Sync pull failed' }, { status: 500 });
  }
}
