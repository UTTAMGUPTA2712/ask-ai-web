import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CustomUser } from "@/types/chat";

export function useChatAuth() {
    const [user, setUser] = useState<CustomUser | null>(null);
    const supabase = createClient();

    useEffect(() => {
        let isInitialLoad = true;

        const handleInitialSession = async () => {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            const manualUserRaw = localStorage.getItem("manual-session");
            const manualUser = manualUserRaw ? JSON.parse(manualUserRaw) as CustomUser : null;
            const currentUser = supabaseUser || manualUser;
            setUser(currentUser as CustomUser | null);
            isInitialLoad = false;
        };

        handleInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (isInitialLoad) return;
            const supabaseUser = session?.user ?? null;

            if (supabaseUser) {
                setUser(supabaseUser as CustomUser);
            } else {
                const manualUserRaw = localStorage.getItem("manual-session");
                if (!manualUserRaw) {
                    setUser(null);
                }
            }
        });

        return () => authListener.subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("manual-session");
        window.location.reload();
    };

    return { user, handleSignOut, supabase };
}
