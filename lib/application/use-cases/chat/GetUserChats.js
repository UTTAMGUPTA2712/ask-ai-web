/**
 * Use Case: Get User Chats
 * Retrieves all chats for a user or guest
 */
export class GetUserChats {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute({ userId, guestIp }) {
        let chats;

        if (userId) {
            chats = await this.chatRepository.findByUserId(userId);
        } else if (guestIp) {
            chats = await this.chatRepository.findByGuestIp(guestIp);
        } else {
            return { chats: [] };
        }

        return {
            chats: chats.map(chat => ({
                id: chat.id,
                title: chat.title,
                created_at: chat.createdAt,
                updated_at: chat.updatedAt,
            })),
        };
    }
}
