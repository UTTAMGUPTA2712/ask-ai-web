/**
 * Repository Interface: Chat Repository
 * Defines contract for chat data access
 */
export class IChatRepository {
    /**
     * Create new chat
     */
    async create(chat) {
        throw new Error('Method not implemented');
    }

    /**
     * Find chat by ID
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all chats for a user
     */
    async findByUserId(userId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all chats for a guest IP
     */
    async findByGuestIp(guestIp) {
        throw new Error('Method not implemented');
    }

    /**
     * Update chat
     */
    async update(chat) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete chat
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}
