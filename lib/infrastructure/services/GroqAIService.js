import { IAIService } from '@/lib/domain/services/IAIService';
import Groq from 'groq-sdk';

/**
 * Groq AI Service Implementation
 * Handles AI completions using Groq API
 */
export class GroqAIService extends IAIService {
    constructor() {
        super();
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        this.modelName = 'llama-3.3-70b-versatile';
    }

    async generateCompletion(messages, systemPrompt = null) {
        try {
            const formattedMessages = [];

            // Add system prompt if provided (for custom GPT)
            if (systemPrompt) {
                formattedMessages.push({
                    role: 'system',
                    content: systemPrompt,
                });
            }

            // Add conversation messages
            formattedMessages.push(...messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })));

            const completion = await this.groq.chat.completions.create({
                model: this.modelName,
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 2048,
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            throw new Error(`AI service error: ${error.message}`);
        }
    }

    async isAvailable() {
        try {
            // Simple check to see if API key is configured
            return !!process.env.GROQ_API_KEY;
        } catch {
            return false;
        }
    }
}
