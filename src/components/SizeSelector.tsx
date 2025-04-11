import React, { useState } from "react";
import { Plus, ChevronDown, X } from "lucide-react";
import { PhotoSize, PaperSize } from "../types";
import { CustomSizeForm } from "./CustomSizeForm";

interface SizeSelectorProps {
  label: string;
  sizes: (PhotoSize | PaperSize)[];
  selectedSize: PhotoSize | PaperSize;
  onSizeSelect: (size: PhotoSize | PaperSize) => void;
  onCustomSizeAdd: (width: number, height: number) => void;
  onCustomSizeDelete?: (size: PhotoSize | PaperSize) => void;
  darkMode: boolean;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  label,
  sizes,
  selectedSize,
  onSizeSelect,
  onCustomSizeAdd,
  onCustomSizeDelete,
  darkMode,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const handleAddCustomSize = (width: number, height: number) => {
    onCustomSizeAdd(width, height);
    setShowCustomForm(false);
    setCustomWidth("");
    setCustomHeight("");
  };

  // Format dimensions with appropriate unit conversions

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label
          className={`block text-sm font-medium ${
            darkMode ? "text-white" : "text-black"
          }`}
        >
          {label}
        </label>
        <span
          className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        ></span>
      </div>
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
                {size.isCustom && " (Custom)"}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none
            ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          />
        </div>
        {selectedSize.isCustom && onCustomSizeDelete && (
          <button
            onClick={() => onCustomSizeDelete(selectedSize)}
            className={`p-2.5 rounded-lg border shadow-sm transition-all duration-200
              ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  : "bg-white border-gray-300 hover:bg-gray-50 text-black"
              }`}
            aria-label="Delete custom size"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => setShowCustomForm(true)}
          className={`p-2.5 rounded-lg border shadow-sm transition-all duration-200 group
            ${
              darkMode
                ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                : "bg-white border-gray-300 hover:bg-gray-50 text-black"
            }`}
          aria-label="Add custom size"
          title="Add custom size"
        >
          <Plus className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-active:scale-95" />
        </button>
      </div>

      {showCustomForm && (
        <CustomSizeForm
          width={customWidth}
          height={customHeight}
          onWidthChange={setCustomWidth}
          onHeightChange={setCustomHeight}
          onCancel={() => setShowCustomForm(false)}
          onAdd={() => {
            const width = parseFloat(customWidth);
            const height = parseFloat(customHeight);
            if (width > 0 && height > 0) {
              handleAddCustomSize(width, height);
            }
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
