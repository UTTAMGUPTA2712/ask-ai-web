import { User } from '@/lib/domain/entities/User';

/**
 * Use Case: Sign Up User
 * Creates a new user account
 */
export class SignUpUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ id, email, name, password }) {
        // Validate input
        if (!id || !email || !password) {
            throw new Error('Missing required fields');
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findById(id);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Create user entity
        const user = new User({
            id,
            email,
            name: name || email.split('@')[0],
            password,
            createdAt: new Date().toISOString(),
            starredGptIds: [],
        });

        // Save to database
        const createdUser = await this.userRepository.create(user);

        return {
            user: {
                id: createdUser.id,
                email: createdUser.email,
                name: createdUser.name,
            },
        };
    }
}
