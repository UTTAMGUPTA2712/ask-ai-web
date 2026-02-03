/**
 * Use Case: Star Custom GPT
 * Adds or removes a GPT from user's starred list
 */
export class StarCustomGPT {
    constructor(userRepository, customGPTRepository) {
        this.userRepository = userRepository;
        this.customGPTRepository = customGPTRepository;
    }

    async execute({ userId, gptId, star = true }) {
        // Get user
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify GPT exists
        const gpt = await this.customGPTRepository.findById(gptId);
        if (!gpt) {
            throw new Error('Custom GPT not found');
        }

        // Update starred list
        if (star) {
            user.starGPT(gptId);
        } else {
            user.unstarGPT(gptId);
        }

        // Save
        await this.userRepository.updateStarredGPTs(userId, user.starredGptIds);

        return {
            success: true,
            starred: star,
        };
    }
}
