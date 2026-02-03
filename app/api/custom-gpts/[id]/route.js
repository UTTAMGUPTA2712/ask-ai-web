import { NextResponse } from 'next/server';
import { CustomGPTRepository } from '@/lib/infrastructure/repositories/CustomGPTRepository';
import { requireAuth } from '@/lib/infrastructure/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const gptId = params.id;

        // Create dependencies
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);

        // Get GPT
        const gpt = await customGPTRepo.findById(gptId);
        if (!gpt) {
            return NextResponse.json({ error: 'Custom GPT not found' }, { status: 404 });
        }

        return NextResponse.json({
            customGPT: {
                id: gpt.id,
                name: gpt.name,
                description: gpt.description,
                system_prompt: gpt.systemPrompt,
                creator_id: gpt.creatorId,
                creator_name: gpt.creatorName,
                is_public: gpt.isPublic,
                created_at: gpt.createdAt,
            },
        });
    } catch (error) {
        console.error('Get custom GPT error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(request, { params }) {
    try {
        const user = await requireAuth(request);
        const gptId = params.id;
        const body = await request.json();

        // Create dependencies
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);

        // Get GPT
        const gpt = await customGPTRepo.findById(gptId);
        if (!gpt) {
            return NextResponse.json({ error: 'Custom GPT not found' }, { status: 404 });
        }

        // Check ownership
        if (!gpt.isOwnedBy(user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update
        gpt.update(body);
        const updated = await customGPTRepo.update(gpt);

        return NextResponse.json({
            customGPT: {
                id: updated.id,
                name: updated.name,
                description: updated.description,
                system_prompt: updated.systemPrompt,
                creator_id: updated.creatorId,
                creator_name: updated.creatorName,
                is_public: updated.isPublic,
                created_at: updated.createdAt,
            },
        });
    } catch (error) {
        console.error('Update custom GPT error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const user = await requireAuth(request);
        const gptId = params.id;

        // Create dependencies
        const customGPTRepo = new CustomGPTRepository(supabaseAdmin);

        // Get GPT
        const gpt = await customGPTRepo.findById(gptId);
        if (!gpt) {
            return NextResponse.json({ error: 'Custom GPT not found' }, { status: 404 });
        }

        // Check ownership
        if (!gpt.isOwnedBy(user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete
        await customGPTRepo.delete(gptId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete custom GPT error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
