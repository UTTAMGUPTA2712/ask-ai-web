import { IMessageRepository } from '@/lib/domain/repositories/IMessageRepository';
import { Message } from '@/lib/domain/entities/Message';

/**
 * Message Repository Implementation
 * Handles message data persistence using Supabase
 */
export class MessageRepository extends IMessageRepository {
    constructor(supabase) {
        super();
        this.supabase = supabase;
    }

    async create(message) {
        const { data, error } = await this.supabase
            .from('messages')
            .insert([{
                chat_id: message.chatId,
                role: message.role,
                content: message.content,
                created_at: message.createdAt,
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create message: ${error.message}`);

        return new Message({
            id: data.id,
            chatId: data.chat_id,
            role: data.role,
            content: data.content,
            createdAt: data.created_at,
        });
    }

    async findByChatId(chatId) {
        const { data, error } = await this.supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(`Failed to find messages: ${error.message}`);

        return data.map(msg => new Message({
            id: msg.id,
            chatId: msg.chat_id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at,
        }));
    }

    async findById(id) {
        const { data, error } = await this.supabase
            .from('messages')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to find message: ${error.message}`);
        }

        return new Message({
            id: data.id,
            chatId: data.chat_id,
            role: data.role,
            content: data.content,
            createdAt: data.created_at,
        });
    }

    async deleteByChatId(chatId) {
        const { error } = await this.supabase
            .from('messages')
            .delete()
            .eq('chat_id', chatId);

        if (error) throw new Error(`Failed to delete messages: ${error.message}`);
    }
}
