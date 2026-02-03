/**
 * Domain Entity: User
 * Represents a user in the system
 */
export class User {
    constructor({ id, email, name, password, createdAt, starredGptIds = [] }) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.createdAt = createdAt;
        this.starredGptIds = starredGptIds;
    }

    /**
     * Check if user has starred a specific GPT
     */
    hasStarredGPT(gptId) {
        return this.starredGptIds.includes(gptId);
    }

    /**
     * Star a GPT
     */
    starGPT(gptId) {
        if (!this.hasStarredGPT(gptId)) {
            this.starredGptIds.push(gptId);
        }
    }

    /**
     * Unstar a GPT
     */
    unstarGPT(gptId) {
        this.starredGptIds = this.starredGptIds.filter(id => id !== gptId);
    }

    /**
     * Get user display name
     */
    getDisplayName() {
        return this.name || this.email.split('@')[0];
    }
}
