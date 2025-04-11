import React, { useState } from "react";

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
  const widthNum = parseFloat(width);
  const heightNum = parseFloat(height);
  const hasError =
    (touched.width && !widthNum) || (touched.height && !heightNum);
  const isValid = widthNum > 0 && heightNum > 0;

  return (
    <div
      className={`mt-3 p-4 rounded-lg border shadow-md transition-all duration-200 animate-scale-in ${
        darkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Width (mm)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
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
                touched.width && !widthNum ? "border-red-500" : ""
              } pl-3 pr-8 py-2`}
              placeholder="e.g. 100"
            />
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs 
              ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              mm
            </span>
          </div>
          {touched.width && !widthNum && (
            <p className="text-xs text-red-500 mt-1">Width is required</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label
            className={`block text-xs font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Height (mm)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
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
                touched.height && !heightNum ? "border-red-500" : ""
              } pl-3 pr-8 py-2`}
              placeholder="e.g. 150"
            />
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs 
              ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              mm
            </span>
          </div>
          {touched.height && !heightNum && (
            <p className="text-xs text-red-500 mt-1">Height is required</p>
          )}
        </div>
      </div>

      {hasError && (
        <p className={`text-xs text-red-500 mt-3`}>
          Please enter valid dimensions greater than 0
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          type="button"
          className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
            darkMode
              ? "text-gray-300 hover:text-white hover:bg-gray-700"
              : "text-gray-600 hover:text-black hover:bg-gray-100"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={onAdd}
          type="button"
          disabled={!isValid}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            isValid
              ? darkMode
                ? "bg-white text-black hover:bg-gray-200 active:bg-gray-300"
                : "bg-black text-white hover:bg-gray-800 active:bg-gray-700"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          Add Size
        </button>
      </div>
    </div>
  );
};
