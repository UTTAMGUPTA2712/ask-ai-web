'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/context/StoreContext';
import { Chrome } from 'lucide-react';
import { toast } from 'sonner';

export function AuthModal({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppStore();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast.error('Failed to sign in with Google');
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">Welcome to Ask AI</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Sign in to save your chat history and create custom GPTs
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <Button
            className="w-full h-11"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
