import { NextResponse } from 'next/server';
import { SignUpUser } from '@/lib/application/use-cases/auth/SignUpUser';
import { UserRepository } from '@/lib/infrastructure/repositories/UserRepository';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id, email, name, password } = body;

        // Create dependencies
        const userRepo = new UserRepository(supabaseAdmin);

        // Execute use case
        const useCase = new SignUpUser(userRepo);
        const result = await useCase.execute({ id, email, name, password });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
