import { CustomGPT } from '@/lib/domain/entities/CustomGPT';
import { v4 as uuidv4 } from 'uuid';

/**
 * Use Case: Create Custom GPT
 * Creates a new custom AI personality
 */
export class CreateCustomGPT {
    constructor(customGPTRepository, userRepository) {
        this.customGPTRepository = customGPTRepository;
        this.userRepository = userRepository;
    }

    async execute({ name, description, systemPrompt, isPublic, creatorId }) {
        // Validate
        const errors = CustomGPT.validate({ name, systemPrompt });
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        // Get creator info
        const creator = await this.userRepository.findById(creatorId);
        if (!creator) {
            throw new Error('Creator not found');
        }

        // Create entity
        const customGPT = new CustomGPT({
            id: uuidv4(),
            name: name.trim(),
            description: description?.trim() || '',
            systemPrompt: systemPrompt.trim(),
            creatorId,
            creatorName: creator.name,
            isPublic: isPublic || false,
            createdAt: new Date().toISOString(),
        });

        // Save
        const created = await this.customGPTRepository.create(customGPT);

        return {
            customGPT: {
                id: created.id,
                name: created.name,
                description: created.description,
                system_prompt: created.systemPrompt,
                creator_id: created.creatorId,
                creator_name: created.creatorName,
                is_public: created.isPublic,
                created_at: created.createdAt,
            },
        };
    }
}
