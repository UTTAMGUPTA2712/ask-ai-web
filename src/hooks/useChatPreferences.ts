import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CustomUser, ChatPreferences } from "@/types/chat";

export function useChatPreferences(user: CustomUser | null) {
    const [preferences, setPreferences] = useState<ChatPreferences>({
        systemPrompt: "You are a helpful and concise AI assistant.",
        maxHistory: 10,
    });
    const supabase = createClient();

    useEffect(() => {
        if (user) {
            loadRemotePreferences(user.id);
        }
    }, [user]);

    const loadRemotePreferences = async (userId: string) => {
        const { data: profile } = await supabase
            .from("profiles")
            .select("system_prompt")
            .eq("id", userId)
            .single();

        if (profile?.system_prompt) {
            setPreferences(prev => ({ ...prev, systemPrompt: profile.system_prompt }));
        }
    };

    const updatePreference = async (key: keyof ChatPreferences, value: string | number) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        if (user) {
            await supabase.from("profiles").update({
                system_prompt: newPrefs.systemPrompt,
                updated_at: new Date().toISOString()
            }).eq("id", user.id);
        }
    };

    return { preferences, updatePreference };
}
