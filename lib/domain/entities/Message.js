/**
 * Domain Entity: Message
 * Represents a single message in a chat
 */
export class Message {
    constructor({ id, chatId, role, content, createdAt }) {
        this.id = id;
        this.chatId = chatId;
        this.role = role; // 'user' or 'assistant'
        this.content = content;
        this.createdAt = createdAt;
    }

    /**
     * Check if message is from user
     */
    isUserMessage() {
        return this.role === 'user';
    }

    /**
     * Check if message is from assistant
     */
    isAssistantMessage() {
        return this.role === 'assistant';
    }

    /**
     * Validate message role
     */
    static isValidRole(role) {
        return ['user', 'assistant'].includes(role);
    }

    /**
     * Create user message
     */
    static createUserMessage(chatId, content) {
        if (!content || content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }

        return new Message({
            id: null, // Will be set by repository
            chatId,
            role: 'user',
            content: content.trim(),
            createdAt: new Date().toISOString(),
        });
    }

    /**
     * Create assistant message
     */
    static createAssistantMessage(chatId, content) {
        return new Message({
            id: null,
            chatId,
            role: 'assistant',
            content,
            createdAt: new Date().toISOString(),
        });
    }
}
