/**
 * Use Case: Get Chat Messages
 * Retrieves all messages for a specific chat
 */
export class GetChatMessages {
    constructor(chatRepository, messageRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
    }

    async execute({ chatId, userId, guestIp }) {
        // Get chat
        const chat = await this.chatRepository.findById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        // Verify ownership
        if (userId && !chat.isOwnedBy(userId)) {
            throw new Error('Unauthorized');
        }

        if (!userId && guestIp && chat.guestIp !== guestIp) {
            throw new Error('Unauthorized');
        }

        // Get messages
        const messages = await this.messageRepository.findByChatId(chatId);

        return {
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                created_at: msg.createdAt,
            })),
        };
    }
}
