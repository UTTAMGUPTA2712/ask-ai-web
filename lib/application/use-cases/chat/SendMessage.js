import { Chat } from '@/lib/domain/entities/Chat';
import { Message } from '@/lib/domain/entities/Message';
import { v4 as uuidv4 } from 'uuid';

/**
 * Use Case: Send Message
 * Handles sending a message and getting AI response
 */
export class SendMessage {
    constructor(chatRepository, messageRepository, customGPTRepository, aiService) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.customGPTRepository = customGPTRepository;
        this.aiService = aiService;
    }

    async execute({ message, chatId, userId, guestIp, customGPTId, previousMessages = [] }) {
        let currentChatId = chatId;
        let chat = null;

        // Get or create chat
        if (currentChatId) {
            chat = await this.chatRepository.findById(currentChatId);
            if (!chat) {
                throw new Error('Chat not found');
            }
        } else {
            // Create new chat
            const title = Chat.generateTitle(message);
            chat = new Chat({
                id: uuidv4(),
                userId: userId || null,
                guestIp: guestIp || null,
                title,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            chat = await this.chatRepository.create(chat);
            currentChatId = chat.id;
        }

        // Create user message
        const userMessage = Message.createUserMessage(currentChatId, message);
        await this.messageRepository.create(userMessage);

        // Get custom GPT if specified
        let systemPrompt = null;
        if (customGPTId) {
            const customGPT = await this.customGPTRepository.findById(customGPTId);
            if (customGPT) {
                systemPrompt = customGPT.systemPrompt;
            }
        }

        // Prepare messages for AI
        const messagesForAI = [
            ...previousMessages,
            { role: 'user', content: message },
        ];

        // Get AI response
        const aiResponse = await this.aiService.generateCompletion(messagesForAI, systemPrompt);

        // Create assistant message
        const assistantMessage = Message.createAssistantMessage(currentChatId, aiResponse);
        const savedAssistantMessage = await this.messageRepository.create(assistantMessage);

        // Update chat timestamp
        chat.touch();
        await this.chatRepository.update(chat);

        return {
            chatId: currentChatId,
            title: chat.title,
            message: {
                role: savedAssistantMessage.role,
                content: savedAssistantMessage.content,
                created_at: savedAssistantMessage.createdAt,
            },
        };
    }
}
