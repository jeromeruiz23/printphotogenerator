import { useEffect } from "react";

type ShortcutConfig = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
};

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(
        (shortcut) =>
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!shortcut.ctrl === event.ctrlKey &&
          !!shortcut.shift === event.shiftKey &&
          !!shortcut.alt === event.altKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};
