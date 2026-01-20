export interface Message {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at?: string;
    chat_id?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    messages: Message[];
    gpt_id?: string | null;
}

export interface CustomGpt {
    id: string;
    name: string;
    description: string;
    instructions: string;
    is_public: boolean;
    user_id: string;
    icon_url?: string;
}

export interface CustomUser {
    id: string;
    email?: string;
}

export interface ChatPreferences {
    systemPrompt: string;
    maxHistory: number;
}
