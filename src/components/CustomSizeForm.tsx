import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

type Unit = "mm" | "px" | "inches";

interface CustomSizeFormProps {
  width: string;
  height: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onCancel: () => void;
  onAdd: () => void;
  darkMode: boolean;
}

export const CustomSizeForm: React.FC<CustomSizeFormProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  onCancel,
  onAdd,
  darkMode,
}) => {
  const [touched, setTouched] = useState({ width: false, height: false });
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>("mm");

  const widthNum = parseFloat(width);
  const heightNum = parseFloat(height);

  // Convert dimensions to mm for validation and storage
  const convertToMM = (value: number, fromUnit: Unit): number => {
    switch (fromUnit) {
      case "inches":
        return value * 25.4;
      case "px":
        return value * 0.264583; // assuming 96 DPI
      default:
        return value;
    }
  };

  useEffect(() => {
    if ((touched.width || touched.height) && (!widthNum || !heightNum)) {
      setError("Both dimensions are required");
    } else if (widthNum <= 0 || heightNum <= 0) {
      setError("Dimensions must be greater than 0");
    } else {
      const widthInMM = convertToMM(widthNum, unit);
      const heightInMM = convertToMM(heightNum, unit);
      
      if (widthInMM > 1000 || heightInMM > 1000) {
        setError(`Maximum size is 1000mm (${Math.round(1000/25.4)}in, ${Math.round(1000/0.264583)}px)`);
      } else {
        setError(null);
      }
    }
  }, [width, height, touched.width, touched.height, widthNum, heightNum, unit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error && widthNum > 0 && heightNum > 0) {
      const widthInMM = convertToMM(widthNum, unit);
      const heightInMM = convertToMM(heightNum, unit);
      onWidthChange(widthInMM.toFixed(2));
      onHeightChange(heightInMM.toFixed(2));
      onAdd();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-3 p-4 rounded-lg border shadow-md transition-all duration-200 animate-scale-in relative ${
        darkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-gray-50 border-gray-200"
      }`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={onCancel}
        className={`absolute right-2 top-2 p-1.5 rounded-full transition-colors ${
          darkMode
            ? "text-gray-400 hover:text-white hover:bg-gray-700"
            : "text-gray-500 hover:text-black hover:bg-gray-200"
        }`}
        aria-label="Close form"
      >
        <X size={14} />
      </button>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Width
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="0.1"
              value={width}
              onChange={(e) => onWidthChange(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, width: true }))}
              className={`w-full rounded-md shadow-sm text-sm transition-all duration-200
                ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                    : "bg-white border-gray-300 text-black focus:border-gray-400"
                } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                  : "focus:ring-gray-500"
              } ${
                touched.width && error ? "border-red-500" : ""
              } pl-3 pr-3 py-2`}
              placeholder="e.g. 100"
              aria-invalid={!!error}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Height
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="0.1"
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, height: true }))}
              className={`w-full rounded-md shadow-sm text-sm transition-all duration-200
                ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                    : "bg-white border-gray-300 text-black focus:border-gray-400"
                } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                darkMode
                  ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                  : "focus:ring-gray-500"
              } ${
                touched.height && error ? "border-red-500" : ""
              } pl-3 pr-3 py-2`}
              placeholder="e.g. 150"
              aria-invalid={!!error}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className={`w-full rounded-md shadow-sm text-sm transition-all duration-200
              ${
                darkMode
                  ? "bg-gray-900 border-gray-700 text-white focus:border-gray-600"
                  : "bg-white border-gray-300 text-black focus:border-gray-400"
              } border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              darkMode
                ? "focus:ring-gray-500 focus:ring-offset-gray-900"
                : "focus:ring-gray-500"
            } py-2 pl-3 pr-8`}
          >
            <option value="mm">mm</option>
            <option value="inches">inches</option>
            <option value="px">pixels</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-3" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
            darkMode
              ? "text-gray-300 hover:text-white hover:bg-gray-700"
              : "text-gray-600 hover:text-black hover:bg-gray-100"
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!!error || !widthNum || !heightNum}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            !error && widthNum > 0 && heightNum > 0
              ? darkMode
                ? "bg-white text-black hover:bg-gray-200 active:bg-gray-300"
                : "bg-black text-white hover:bg-gray-800 active:bg-gray-700"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          Add Size
        </button>
      </div>
    </form>
  );
};
