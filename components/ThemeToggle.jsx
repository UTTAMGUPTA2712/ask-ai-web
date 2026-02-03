'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const handleClick = (e) => {
        e.stopPropagation(); // Prevent parent button click
        toggleTheme();
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="h-9 w-9"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon className="h-4 w-4 transition-all" />
            ) : (
                <Sun className="h-4 w-4 transition-all" />
            )}
        </Button>
    );
}
