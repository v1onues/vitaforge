import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { supabaseUrl, supabaseAnonKey, syncId, encryptedData } = await request.json();
    if (!supabaseUrl || !supabaseAnonKey || !syncId || !encryptedData) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase
      .from('sync_data')
      .upsert({ id: syncId, encrypted_data: encryptedData, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Sync push failed' }, { status: 500 });
  }
}
