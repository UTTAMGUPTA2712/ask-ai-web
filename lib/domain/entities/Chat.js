/**
 * Domain Entity: Chat
 * Represents a conversation between user and AI
 */
export class Chat {
    constructor({ id, userId, guestIp, title, createdAt, updatedAt }) {
        this.id = id;
        this.userId = userId;
        this.guestIp = guestIp;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Check if chat is owned by a specific user
     */
    isOwnedBy(userId) {
        return this.userId === userId;
    }

    /**
     * Check if chat is a guest chat (no user ID)
     */
    isGuestChat() {
        return !this.userId && !!this.guestIp;
    }

    /**
     * Update chat title
     */
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim().length === 0) {
            throw new Error('Title cannot be empty');
        }
        this.title = newTitle.trim();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Generate title from first message
     */
    static generateTitle(message, maxLength = 50) {
        const trimmed = message.trim();
        return trimmed.substring(0, maxLength) + (trimmed.length > maxLength ? '...' : '');
    }

    /**
     * Mark chat as updated
     */
    touch() {
        this.updatedAt = new Date().toISOString();
    }
}
