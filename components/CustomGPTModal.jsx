'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { getAuthHeaders } from '@/lib/utils/getAuthHeaders';
import { toast } from 'sonner';

export function CustomGPTModal({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !systemPrompt) {
      toast.error('Please provide a name and system prompt');
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await fetch('/api/custom-gpts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          description,
          system_prompt: systemPrompt,
          is_public: isPublic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create custom GPT');
      }

      toast.success('Custom GPT created successfully!');
      setName('');
      setDescription('');
      setSystemPrompt('');
      setIsPublic(false);
      onOpenChange(false);
      if (onCreated) onCreated();
    } catch (error) {
      toast.error(error.message || 'Failed to create custom GPT');
      console.error('Create GPT error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Create Custom GPT</DialogTitle>
          <DialogDescription className="text-sm">
            Create a custom AI personality with a specific system prompt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="gpt-name" className="text-sm">Name</Label>
            <Input
              id="gpt-name"
              placeholder="e.g., Python Tutor, Creative Writer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpt-description" className="text-sm">Description (Optional)</Label>
            <Input
              id="gpt-description"
              placeholder="Brief description of this GPT"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpt-prompt" className="text-sm">System Prompt</Label>
            <Textarea
              id="gpt-prompt"
              placeholder="e.g., You are an expert Python tutor. Help users learn Python programming with clear explanations and examples."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              className="text-base resize-none"
            />
          </div>

          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="gpt-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="mt-0.5"
            />
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="gpt-public"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Make this GPT public
              </Label>
              <p className="text-xs text-muted-foreground">
                Public GPTs are visible to all users in the Custom GPT Gallery
              </p>
            </div>
          </div>

          <Button
            className="w-full h-11"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Custom GPT'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
