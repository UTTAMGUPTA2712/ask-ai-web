import { User } from '@/lib/domain/entities/User';

/**
 * Use Case: Sync Google User
 * Ensures a Google authenticated user exists in the database
 */
export class SyncGoogleUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ id, email, name }) {
        if (!id || !email) {
            throw new Error('ID and email are required');
        }

        // Check if user exists
        const existingUser = await this.userRepository.findById(id);

        if (!existingUser) {
            // Create new user if not exists
            const newUser = new User({
                id,
                email,
                name: name || email.split('@')[0],
                password: "password123", // No password for Google users initially
                createdAt: new Date().toISOString(),
                starredGptIds: [],
            });

            const createdUser = await this.userRepository.create(newUser);
            return { user: createdUser, isNew: true };
        }

        return { user: existingUser, isNew: false };
    }
}
