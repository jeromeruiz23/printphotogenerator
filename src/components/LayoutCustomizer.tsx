import React from "react";
import { LayoutOptions } from "../types";

interface LayoutCustomizerProps {
  options: LayoutOptions;
  onChange: (options: LayoutOptions) => void;
  darkMode: boolean;
}

export const LayoutCustomizer: React.FC<LayoutCustomizerProps> = ({
  options,
  onChange,
  darkMode,
}) => {
  const handleChange = (field: keyof LayoutOptions, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    onChange({
      ...options,
      [field]: numValue,
    });
  };

  const defaults = { rows: "Auto", photosPerRow: "Auto" };

  return (
    <div className="space-y-4">
      <h3
        className={`text-sm font-medium ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Layout Customization
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Photos per Row
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={options.customPhotosPerRow ?? ""}
              onChange={(e) =>
                handleChange("customPhotosPerRow", e.target.value)
              }
              className={`w-full rounded-md shadow-sm text-sm transition-all duration-200
                ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                    : "bg-white border-gray-300 text-black focus:border-gray-400"
                } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                  : "focus:ring-gray-500"
              } pl-3 pr-3 py-2`}
              placeholder={defaults.photosPerRow.toString()}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Default: {defaults.photosPerRow}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Number of Rows
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={options.customRows ?? ""}
              onChange={(e) => handleChange("customRows", e.target.value)}
              className={`w-full rounded-md shadow-sm text-sm transition-all duration-200
                ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                    : "bg-white border-gray-300 text-black focus:border-gray-400"
                } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                  : "focus:ring-gray-500"
              } pl-3 pr-3 py-2`}
              placeholder={defaults.rows.toString()}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Default: {defaults.rows}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Padding (mm)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.5"
              value={options.customPadding ?? ""}
              onChange={(e) => handleChange("customPadding", e.target.value)}
              className={`w-full rounded-md shadow-sm text-sm transition-all duration-200
                ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                    : "bg-white border-gray-300 text-black focus:border-gray-400"
                } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                  : "focus:ring-gray-500"
              } pl-3 pr-3 py-2`}
              placeholder="2"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Default: 2
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onChange({})}
        className={`text-sm ${
          darkMode
            ? "text-gray-400 hover:text-white"
            : "text-gray-500 hover:text-black"
        }`}
      >
        Reset to Auto
      </button>
    </div>
  );
};
