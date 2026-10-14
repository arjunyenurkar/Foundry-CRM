import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyPassword } from '@/lib/authCrypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Fetch user from Supabase profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email.trim())
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Invalid email or user not found' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, profile.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Return profile data without sensitive hash
    const { password_hash, ...safeProfile } = profile;
    return NextResponse.json({
      success: true,
      user: safeProfile
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error during authentication' },
      { status: 500 }
    );
  }
}
