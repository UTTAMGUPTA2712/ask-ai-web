import { IUserRepository } from '@/lib/domain/repositories/IUserRepository';
import { User } from '@/lib/domain/entities/User';

/**
 * User Repository Implementation
 * Handles user data persistence using Supabase
 */
export class UserRepository extends IUserRepository {
    constructor(supabase) {
        super();
        this.supabase = supabase;
    }

    async findById(id) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to find user: ${error.message}`);
        }

        return new User({
            id: data.id,
            email: data.email,
            name: data.name,
            password: data.password,
            createdAt: data.created_at,
            starredGptIds: data.starred_gpt_ids || [],
        });
    }

    async findByEmail(email) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to find user: ${error.message}`);
        }

        return new User({
            id: data.id,
            email: data.email,
            name: data.name,
            password: data.password,
            createdAt: data.created_at,
            starredGptIds: data.starred_gpt_ids || [],
        });
    }

    async create(user) {
        const { data, error } = await this.supabase
            .from('users')
            .insert([{
                id: user.id,
                email: user.email,
                name: user.name,
                password: user.password,
                created_at: user.createdAt,
                starred_gpt_ids: user.starredGptIds,
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create user: ${error.message}`);

        return new User({
            id: data.id,
            email: data.email,
            name: data.name,
            password: data.password,
            createdAt: data.created_at,
            starredGptIds: data.starred_gpt_ids || [],
        });
    }

    async update(user) {
        const { data, error } = await this.supabase
            .from('users')
            .update({
                name: user.name,
                starred_gpt_ids: user.starredGptIds,
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update user: ${error.message}`);

        return new User({
            id: data.id,
            email: data.email,
            name: data.name,
            password: data.password,
            createdAt: data.created_at,
            starredGptIds: data.starred_gpt_ids || [],
        });
    }

    async updateStarredGPTs(userId, starredGptIds) {
        const { data, error } = await this.supabase
            .from('users')
            .update({ starred_gpt_ids: starredGptIds })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update starred GPTs: ${error.message}`);

        return new User({
            id: data.id,
            email: data.email,
            name: data.name,
            password: data.password,
            createdAt: data.created_at,
            starredGptIds: data.starred_gpt_ids || [],
        });
    }
}
