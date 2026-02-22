
import { useEffect } from 'react';
import { useBuilderStore } from './store';

export function useBuilderKeyboardShortcuts() {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const { undo, redo } = useBuilderStore.temporal.getState();
            const isMod = e.ctrlKey || e.metaKey;

            if (isMod && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }

            if (isMod && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
