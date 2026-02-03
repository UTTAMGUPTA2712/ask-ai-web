/**
 * Repository Interface: CustomGPT Repository
 * Defines contract for custom GPT data access
 */
export class ICustomGPTRepository {
    /**
     * Create new custom GPT
     */
    async create(customGPT) {
        throw new Error('Method not implemented');
    }

    /**
     * Find custom GPT by ID
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all custom GPTs created by a user
     */
    async findByCreatorId(creatorId) {
        throw new Error('Method not implemented');
    }

    /**
     * Find all public custom GPTs
     */
    async findPublic(userId = null) {
        throw new Error('Method not implemented');
    }

    /**
     * Find starred GPTs for a user
     */
    async findStarredByUserId(userId) {
        throw new Error('Method not implemented');
    }

    /**
     * Update custom GPT
     */
    async update(customGPT) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete custom GPT
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}
