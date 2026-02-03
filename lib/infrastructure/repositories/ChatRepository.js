import { IChatRepository } from '@/lib/domain/repositories/IChatRepository';
import { Chat } from '@/lib/domain/entities/Chat';

/**
 * Chat Repository Implementation
 * Handles chat data persistence using Supabase
 */
export class ChatRepository extends IChatRepository {
    constructor(supabase) {
        super();
        this.supabase = supabase;
    }

    async create(chat) {
        const { data, error } = await this.supabase
            .from('chats')
            .insert([{
                id: chat.id,
                user_id: chat.userId,
                guest_ip: chat.guestIp,
                title: chat.title,
                created_at: chat.createdAt,
                updated_at: chat.updatedAt,
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create chat: ${error.message}`);

        return new Chat({
            id: data.id,
            userId: data.user_id,
            guestIp: data.guest_ip,
            title: data.title,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        });
    }

    async findById(id) {
        const { data, error } = await this.supabase
            .from('chats')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find chat: ${error.message}`);
        }

        return new Chat({
            id: data.id,
            userId: data.user_id,
            guestIp: data.guest_ip,
            title: data.title,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        });
    }

    async findByUserId(userId) {
        const { data, error } = await this.supabase
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw new Error(`Failed to find chats: ${error.message}`);

        return data.map(chat => new Chat({
            id: chat.id,
            userId: chat.user_id,
            guestIp: chat.guest_ip,
            title: chat.title,
            createdAt: chat.created_at,
            updatedAt: chat.updated_at,
        }));
    }

    async findByGuestIp(guestIp) {
        const { data, error } = await this.supabase
            .from('chats')
            .select('*')
            .eq('guest_ip', guestIp)
            .order('updated_at', { ascending: false });

        if (error) throw new Error(`Failed to find chats: ${error.message}`);

        return data.map(chat => new Chat({
            id: chat.id,
            userId: chat.user_id,
            guestIp: chat.guest_ip,
            title: chat.title,
            createdAt: chat.created_at,
            updatedAt: chat.updated_at,
        }));
    }

    async update(chat) {
        const { data, error } = await this.supabase
            .from('chats')
            .update({
                title: chat.title,
                updated_at: chat.updatedAt,
            })
            .eq('id', chat.id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update chat: ${error.message}`);

        return new Chat({
            id: data.id,
            userId: data.user_id,
            guestIp: data.guest_ip,
            title: data.title,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        });
    }

    async delete(id) {
        const { error } = await this.supabase
            .from('chats')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete chat: ${error.message}`);
    }
}
