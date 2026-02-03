import { NextResponse } from 'next/server';
import { StarCustomGPT } from '@/lib/application/use-cases/custom-gpt/StarCustomGPT';
import { UserRepository } from '@/lib/infrastructure/repositories/UserRepository';
import { CustomGPTRepository } from '@/lib/infrastructure/repositories/CustomGPTRepository';
import { requireAuth } from '@/lib/infrastructure/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    try {
        const user = await requireAuth(request);
        const gptId = params.id;

        // Create dependencies
        const userRepo = new UserRepository(supabaseAdmin);
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);

        // Execute use case
        const useCase = new StarCustomGPT(userRepo, customGPTRepo);
        const result = await useCase.execute({
            userId: user.id,
            gptId,
            star: true,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Star GPT error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const user = await requireAuth(request);
        const gptId = params.id;

        // Create dependencies
        const userRepo = new UserRepository(supabaseAdmin);
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);

        // Execute use case
        const useCase = new StarCustomGPT(userRepo, customGPTRepo);
        const result = await useCase.execute({
            userId: user.id,
            gptId,
            star: false,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Unstar GPT error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
