/**
 * Service Interface: AI Service
 * Defines contract for AI completion services
 */
export class IAIService {
    /**
     * Generate AI completion
     * @param {Array} messages - Array of message objects with role and content
     * @param {string} systemPrompt - Optional system prompt for custom GPT
     * @returns {Promise<string>} - AI generated response
     */
    async generateCompletion(messages, systemPrompt = null) {
        throw new Error('Method not implemented');
    }

    /**
     * Check if AI service is available
     * @returns {Promise<boolean>}
     */
    async isAvailable() {
        throw new Error('Method not implemented');
    }
}
