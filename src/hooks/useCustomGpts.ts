import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CustomGpt, CustomUser } from "@/types/chat";

export function useCustomGpts(user: CustomUser | null) {
    const [customGpts, setCustomGpts] = useState<CustomGpt[]>([]);
    const [isGptModalOpen, setIsGptModalOpen] = useState(false);
    const [editingGpt, setEditingGpt] = useState<CustomGpt | null>(null);
    const [isGptSaving, setIsGptSaving] = useState(false);

    const supabase = createClient();

    const loadCustomGpts = async (userId: string | null) => {
        let query = supabase.from("custom_gpts").select("*");

        if (userId) {
            query = query.or(`user_id.eq.${userId},is_public.eq.true`);
        } else {
            query = query.eq("is_public", true);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (!error && data) {
            setCustomGpts(data);
        }
    };

    useEffect(() => {
        loadCustomGpts(user?.id || null);
    }, [user]);

    const saveGpt = async (formData: FormData) => {
        if (!user) return;
        setIsGptSaving(true);
        console.log("Attempting to save GPT persona...");

        try {
            const name = (formData.get("name") as string).trim();
            const instructions = (formData.get("instructions") as string)
                .replace(/\r\n/g, "\n")
                .replace(/\n{3,}/g, "\n\n") // Collapse 3+ newlines into 2
                .replace(/[ \t]+/g, " ")    // Collapse multiple spaces/tabs
                .trim();
            const description = (formData.get("description") as string).trim();
            const user_instruction = (formData.get("user_instruction") as string)?.replace(/\r\n/g, "\n").trim();
            const is_public = formData.get("is_public") === "on";

            console.log("Normalized Payload size:", {
                name: name.length,
                instructions: instructions.length,
                description: description.length,
                user_instruction: user_instruction?.length || 0
            });

            const savePromise = editingGpt
                ? supabase.from("custom_gpts").update({ name, instructions, description, user_instruction, is_public }).eq("id", editingGpt.id)
                : supabase.from("custom_gpts").insert({ user_id: user.id, name, instructions, description, user_instruction, is_public });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Database operation timed out after 10 seconds. This usually happens if the network is very slow or the payload is being blocked.")), 10000)
            );

            const result: any = await Promise.race([savePromise, timeoutPromise]);

            if (result.error) {
                console.error("Supabase Error:", result.error);
                throw result.error;
            }

            console.log("GPT saved successfully!");
            await loadCustomGpts(user.id);
            setIsGptModalOpen(false);
            setEditingGpt(null);
        } catch (err: any) {
            console.error("Full Error Object:", err);
            alert(`Save Failed: ${err.message || 'Unknown error'}. \n\nEnsure you have run the required SQL scripts for the 'user_instruction' column!`);
            throw err;
        } finally {
            setIsGptSaving(false);
        }
    };

    const toggleStarGpt = async (gptId: string, isCurrentlyStarred: boolean) => {
        if (!user) return;
        try {
            const currentStars = user.starred_gpt_ids || [];
            const newStars = isCurrentlyStarred
                ? currentStars.filter(id => id !== gptId)
                : [...currentStars, gptId];

            const { error } = await supabase
                .from("profiles")
                .update({ starred_gpt_ids: newStars })
                .eq("id", user.id);

            if (error) throw error;

            // Note: useChatAuth should ideally handle the update via onAuthStateChange 
            // but we might need to manually trigger a reload or update local state if auth listener isn't enough.
            // For now, we rely on the implementation plan's structure.
            window.location.reload(); // Quick fix to refresh user state from DB
        } catch (err) {
            console.error("Error toggling star:", err);
        }
    };

    const deleteGpt = async (gptId: string) => {
        if (!user) return;
        if (confirm("Are you sure you want to delete this GPT?")) {
            await supabase.from("custom_gpts").delete().eq("id", gptId);
            await loadCustomGpts(user.id);
        }
    };

    return {
        customGpts,
        isGptModalOpen,
        setIsGptModalOpen,
        editingGpt,
        setEditingGpt,
        isGptSaving,
        saveGpt,
        deleteGpt,
        toggleStarGpt,
        loadCustomGpts
    };
}
