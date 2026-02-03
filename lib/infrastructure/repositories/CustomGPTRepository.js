import { ICustomGPTRepository } from '@/lib/domain/repositories/ICustomGPTRepository';
import { CustomGPT } from '@/lib/domain/entities/CustomGPT';

/**
 * CustomGPT Repository Implementation
 * Handles custom GPT data persistence using Supabase
 */
export class CustomGPTRepository extends ICustomGPTRepository {
    constructor(supabase) {
        super();
        this.supabase = supabase;
    }

    async create(customGPT) {
        const { data, error } = await this.supabase
            .from('custom_gpts')
            .insert([{
                id: customGPT.id,
                name: customGPT.name,
                description: customGPT.description,
                system_prompt: customGPT.systemPrompt,
                user_id: customGPT.creatorId,  // Database uses user_id not creator_id
                is_public: customGPT.isPublic,
                created_at: customGPT.createdAt,
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create custom GPT: ${error.message}`);

        // Get creator name
        const { data: userData } = await this.supabase
            .from('users')
            .select('name')
            .eq('id', data.user_id)
            .single();

        return new CustomGPT({
            id: data.id,
            name: data.name,
            description: data.description,
            systemPrompt: data.system_prompt,
            creatorId: data.user_id,
            creatorName: userData?.name,
            isPublic: data.is_public,
            createdAt: data.created_at,
        });
    }

    async findById(id) {
        const { data, error } = await this.supabase
            .from('custom_gpts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to find custom GPT: ${error.message}`);
        }

        // Get creator name
        const { data: userData } = await this.supabase
            .from('users')
            .select('name')
            .eq('id', data.user_id)
            .single();

        return new CustomGPT({
            id: data.id,
            name: data.name,
            description: data.description,
            systemPrompt: data.system_prompt,
            creatorId: data.user_id,
            creatorName: userData?.name,
            isPublic: data.is_public,
            createdAt: data.created_at,
        });
    }

    async findByCreatorId(creatorId) {
        const { data, error } = await this.supabase
            .from('custom_gpts')
            .select('*')
            .eq('user_id', creatorId)  // Database uses user_id not creator_id
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to find custom GPTs: ${error.message}`);

        // Get creator name
        let creatorName = null;
        if (data.length > 0) {
            const { data: userData } = await this.supabase
                .from('users')
                .select('name')
                .eq('id', creatorId)
                .single();
            creatorName = userData?.name;
        }

        return data.map(gpt => new CustomGPT({
            id: gpt.id,
            name: gpt.name,
            description: gpt.description,
            systemPrompt: gpt.system_prompt,
            creatorId: gpt.user_id,
            creatorName: creatorName,
            isPublic: gpt.is_public,
            createdAt: gpt.created_at,
        }));
    }

    async findPublic(userId = null) {
        const { data, error } = await this.supabase
            .from('custom_gpts')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to find public GPTs: ${error.message}`);

        // Get user's starred GPT IDs if userId provided
        let starredIds = [];
        if (userId) {
            const { data: userData } = await this.supabase
                .from('users')
                .select('starred_gpt_ids')
                .eq('id', userId)
                .single();
            starredIds = userData?.starred_gpt_ids || [];
        }

        // Get all unique creator IDs
        const creatorIds = [...new Set(data.map(gpt => gpt.user_id))];

        // Fetch all creator names in one query
        const { data: usersData } = await this.supabase
            .from('users')
            .select('id, name')
            .in('id', creatorIds);

        const creatorMap = {};
        usersData?.forEach(user => {
            creatorMap[user.id] = user.name;
        });

        return data.map(gpt => new CustomGPT({
            id: gpt.id,
            name: gpt.name,
            description: gpt.description,
            systemPrompt: gpt.system_prompt,
            creatorId: gpt.user_id,
            creatorName: creatorMap[gpt.user_id],
            isPublic: gpt.is_public,
            createdAt: gpt.created_at,
            isStarred: starredIds.includes(gpt.id),
        }));
    }

    async findStarredByUserId(userId) {
        // First get user's starred GPT IDs
        const { data: userData, error: userError } = await this.supabase
            .from('users')
            .select('starred_gpt_ids')
            .eq('id', userId)
            .single();

        if (userError) throw new Error(`Failed to find user: ${userError.message}`);

        const starredIds = userData.starred_gpt_ids || [];
        if (starredIds.length === 0) return [];

        // Then get the GPTs
        const { data, error } = await this.supabase
            .from('custom_gpts')
            .select('*')
            .in('id', starredIds);

        if (error) throw new Error(`Failed to find starred GPTs: ${error.message}`);

        // Get all unique creator IDs
        const creatorIds = [...new Set(data.map(gpt => gpt.user_id))];

        // Fetch all creator names in one query
        const { data: usersData } = await this.supabase
            .from('users')
            .select('id, name')
            .in('id', creatorIds);

        const creatorMap = {};
        usersData?.forEach(user => {
            creatorMap[user.id] = user.name;
        });

        return data.map(gpt => new CustomGPT({
            id: gpt.id,
            name: gpt.name,
            description: gpt.description,
            systemPrompt: gpt.system_prompt,
            creatorId: gpt.user_id,
            creatorName: creatorMap[gpt.user_id],
            isPublic: gpt.is_public,
            createdAt: gpt.created_at,
            isStarred: true,
        }));
    }

    async update(customGPT) {
        const { data, error } = await this.supabase
            .from('custom_gpts')
            .update({
                name: customGPT.name,
                description: customGPT.description,
                system_prompt: customGPT.systemPrompt,
                is_public: customGPT.isPublic,
            })
            .eq('id', customGPT.id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update custom GPT: ${error.message}`);

        // Get creator name
        const { data: userData } = await this.supabase
            .from('users')
            .select('name')
            .eq('id', data.user_id)
            .single();

        return new CustomGPT({
            id: data.id,
            name: data.name,
            description: data.description,
            systemPrompt: data.system_prompt,
            creatorId: data.user_id,
            creatorName: userData?.name,
            isPublic: data.is_public,
            createdAt: data.created_at,
        });
    }

    async delete(id) {
        const { error } = await this.supabase
            .from('custom_gpts')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete custom GPT: ${error.message}`);
    }
}
