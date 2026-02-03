/**
 * Repository Interface: User Repository
 * Defines contract for user data access
 */
export class IUserRepository {
    /**
     * Find user by ID
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        throw new Error('Method not implemented');
    }

    /**
     * Create new user
     */
    async create(user) {
        throw new Error('Method not implemented');
    }

    /**
     * Update user
     */
    async update(user) {
        throw new Error('Method not implemented');
    }

    /**
     * Update user's starred GPT IDs
     */
    async updateStarredGPTs(userId, starredGptIds) {
        throw new Error('Method not implemented');
    }
}
