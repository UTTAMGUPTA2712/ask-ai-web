/**
 * Repository Interface: Message Repository
 * Defines contract for message data access
 */
export class IMessageRepository {
    /**
     * Create new message
     */
    async create(message) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all messages for a chat
     */
    async findByChatId(chatId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find message by ID
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete all messages for a chat
     */
    async deleteByChatId(chatId) {
        throw new Error('Method not implemented');
    }
}
