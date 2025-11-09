// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onNewTask?: () => void;
  onStopTimer?: () => void;
  onQuickTimer?: () => void;
  onEditTask?: () => void;
  onEscape?: () => void;
}

/**
 * Custom hook for keyboard shortcuts
 *
 * Shortcuts:
 * - Cmd/Ctrl + T: Start timer on last task / New task
 * - Cmd/Ctrl + S: Stop current running timer
 * - Cmd/Ctrl + N: New task + start timer
 * - Cmd/Ctrl + E: Edit current task
 * - Esc: Close modals
 */
export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Still allow Escape to work in inputs
        if (e.key === 'Escape' && handlers.onEscape) {
          handlers.onEscape();
        }
        return;
      }

      // Cmd/Ctrl + T: Quick timer
      if (modifier && e.key === 't') {
        e.preventDefault();
        handlers.onQuickTimer?.();
      }

      // Cmd/Ctrl + S: Stop timer
      if (modifier && e.key === 's') {
        e.preventDefault();
        handlers.onStopTimer?.();
      }

      // Cmd/Ctrl + N: New task
      if (modifier && e.key === 'n') {
        e.preventDefault();
        handlers.onNewTask?.();
      }

      // Cmd/Ctrl + E: Edit task
      if (modifier && e.key === 'e') {
        e.preventDefault();
        handlers.onEditTask?.();
      }

      // Escape: Close modals
      if (e.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
};
