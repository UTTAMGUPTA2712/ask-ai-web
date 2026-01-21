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
        try {
            const name = formData.get("name") as string;
            const instructions = formData.get("instructions") as string;
            const description = formData.get("description") as string;
            const user_instruction = formData.get("user_instruction") as string;
            const is_public = formData.get("is_public") === "on";

            const savePromise = editingGpt
                ? supabase.from("custom_gpts").update({ name, instructions, description, user_instruction, is_public }).eq("id", editingGpt.id)
                : supabase.from("custom_gpts").insert({ user_id: user.id, name, instructions, description, user_instruction, is_public });

            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Database operation timed out.")), 10000));
            const result: any = await Promise.race([savePromise, timeoutPromise]);

            if (result.error) throw new Error(result.error.message);

            await loadCustomGpts(user.id);
            setIsGptModalOpen(false);
            setEditingGpt(null);
        } catch (err) {
            console.error("Error saving GPT:", err);
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
