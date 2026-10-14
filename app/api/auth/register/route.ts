import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { hashPassword } from '@/lib/authCrypto';

export async function POST(request: Request) {
  try {
    const { name, email, password, role, avatar_url } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);
    const newId = crypto.randomUUID();

    const { data: newUser, error } = await supabase
      .from('profiles')
      .insert({
        id: newId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role || 'Sales Executive',
        avatar_url: avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        password_hash: hashedPassword
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { password_hash, ...safeProfile } = newUser;
    return NextResponse.json({
      success: true,
      user: safeProfile
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error during registration' },
      { status: 500 }
    );
  }
}
