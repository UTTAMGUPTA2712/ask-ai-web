/**
 * Domain Entity: CustomGPT
 * Represents a custom AI personality/assistant
 */
export class CustomGPT {
    constructor({
        id,
        name,
        description,
        systemPrompt,
        creatorId,
        creatorName,
        isPublic,
        createdAt,
        isStarred = false
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.systemPrompt = systemPrompt;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.isPublic = isPublic;
        this.createdAt = createdAt;
        this.isStarred = isStarred;
    }

    /**
     * Check if GPT is owned by a specific user
     */
    isOwnedBy(userId) {
        return this.creatorId === userId;
    }

    /**
     * Make GPT public
     */
    makePublic() {
        this.isPublic = true;
    }

    /**
     * Make GPT private
     */
    makePrivate() {
        this.isPublic = false;
    }

    /**
     * Update GPT details
     */
    update({ name, description, systemPrompt, isPublic }) {
        if (name !== undefined) this.name = name;
        if (description !== undefined) this.description = description;
        if (systemPrompt !== undefined) this.systemPrompt = systemPrompt;
        if (isPublic !== undefined) this.isPublic = isPublic;
    }

    /**
     * Validate GPT data
     */
    static validate({ name, systemPrompt }) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('Name is required');
        }

        if (!systemPrompt || systemPrompt.trim().length === 0) {
            errors.push('System prompt is required');
        }

        if (name && name.length > 100) {
            errors.push('Name must be less than 100 characters');
        }

        return errors;
    }
}
