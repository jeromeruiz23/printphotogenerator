import React from "react";
import { Grid, Layout as LayoutIcon } from "lucide-react";
import { LayoutType } from "../types";

interface LayoutTypeSelectorProps {
  layoutType: LayoutType;
  onLayoutChange: (type: LayoutType) => void;
  darkMode: boolean;
}

export const LayoutTypeSelector: React.FC<LayoutTypeSelectorProps> = ({
  layoutType,
  onLayoutChange,
  darkMode,
}) => {
  const layouts: { type: LayoutType; label: string; icon: typeof Grid }[] = [
    { type: "grid", label: "Grid Layout", icon: Grid },
    { type: "photobooth", label: "Photo Booth", icon: LayoutIcon },
  ];

  return (
    <div className="space-y-3">
      <label
        className={`block text-sm font-medium ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Layout Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        {layouts.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onLayoutChange(type)}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              layoutType === type
                ? darkMode
                  ? "bg-white text-black ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                  : "bg-black text-white ring-2 ring-black ring-offset-2"
                : darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform duration-200 ${
                layoutType === type ? "scale-110" : "group-hover:scale-110"
              }`}
            />
            <span className="text-sm font-medium">{label}</span>
            {layoutType === type && (
              <span
                className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full ${
                  darkMode ? "bg-gray-900" : "bg-white"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    darkMode ? "bg-white" : "bg-black"
                  }`}
                />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
