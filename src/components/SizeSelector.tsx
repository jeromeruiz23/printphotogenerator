import React, { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { PhotoSize, PaperSize } from "../types";

interface SizeSelectorProps {
  label: string;
  sizes: (PhotoSize | PaperSize)[];
  selectedSize: PhotoSize | PaperSize;
  onSizeSelect: (size: PhotoSize | PaperSize) => void;
  onCustomSizeAdd: (width: number, height: number) => void;
  darkMode: boolean;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  label,
  sizes,
  selectedSize,
  onSizeSelect,
  onCustomSizeAdd,
  darkMode,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const handleAddCustomSize = () => {
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);
    if (width > 0 && height > 0) {
      onCustomSizeAdd(width, height);
      setShowCustomForm(false);
      setCustomWidth("");
      setCustomHeight("");
    }
  };

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-medium ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        {label}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            className={`w-full appearance-none rounded-lg pl-4 pr-10 py-2.5 shadow-sm transition-all duration-200
              ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700 focus:border-gray-600"
                  : "bg-white text-black border-gray-300 hover:bg-gray-50 focus:border-gray-400"
              } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode
                ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                : "focus:ring-gray-500"
            }`}
            value={selectedSize.label}
            onChange={(e) => {
              const size = sizes.find((s) => s.label === e.target.value);
              if (size) onSizeSelect(size);
            }}
          >
            {sizes.map((size) => (
              <option key={size.label} value={size.label}>
                {size.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none
            ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          />
        </div>
        <button
          onClick={() => setShowCustomForm(true)}
          className={`p-2.5 rounded-lg border shadow-sm transition-all duration-200 group
            ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-300 hover:bg-gray-50 text-black"
            }`}
          aria-label="Add custom size"
        >
          <Plus className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-active:scale-95" />
        </button>
      </div>

      {showCustomForm && (
        <div
          className={`mt-3 p-4 rounded-lg border shadow-sm ${
            darkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                className={`block text-xs font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Width (mm)
              </label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className={`w-full rounded-md shadow-sm text-sm transition-colors duration-200
                  ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                      : "bg-white border-gray-300 text-black focus:border-gray-400"
                  } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                    : "focus:ring-gray-500"
                }`}
                placeholder="e.g. 100"
              />
            </div>
            <div className="space-y-1">
              <label
                className={`block text-xs font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Height (mm)
              </label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className={`w-full rounded-md shadow-sm text-sm transition-colors duration-200
                  ${
                    darkMode
                      ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                      : "bg-white border-gray-300 text-black focus:border-gray-400"
                  } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode
                    ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                    : "focus:ring-gray-500"
                }`}
                placeholder="e.g. 150"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowCustomForm(false)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${
                darkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomSize}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                darkMode
                  ? "bg-white text-black hover:bg-gray-200 active:bg-gray-300"
                  : "bg-black text-white hover:bg-gray-800 active:bg-gray-700"
              }`}
            >
              Add Size
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
