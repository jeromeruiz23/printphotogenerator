import React from "react";
import { PhotoboothTemplate } from "../types";

interface PhotoboothTemplateSelectorProps {
  template: PhotoboothTemplate;
  onTemplateChange: (template: PhotoboothTemplate) => void;
  darkMode: boolean;
}

export const PhotoboothTemplateSelector: React.FC<
  PhotoboothTemplateSelectorProps
> = ({ template, onTemplateChange, darkMode }) => {
  const templates: { id: PhotoboothTemplate; label: string }[] = [
    { id: "classic", label: "Classic (2×2)" },
    { id: "strips", label: "Photo Strips" },
    { id: "collage", label: "Collage (3×2)" },
  ];

  return (
    <div className="mb-4">
      <label
        className={`block text-sm font-medium mb-3 ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Photobooth Template
      </label>
      <div className="grid grid-cols-3 gap-3">
        {templates.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTemplateChange(id)}
            className={`relative flex flex-col items-center p-4 rounded-lg transition-all duration-200 group ${
              template === id
                ? darkMode
                  ? "bg-white text-black ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                  : "bg-black text-white ring-2 ring-black ring-offset-2"
                : darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            <div className="relative w-full aspect-square mb-3">
              {id === "classic" && (
                <div className="absolute inset-2 grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm transition-all duration-200 ${
                        template === id
                          ? "bg-current opacity-20 group-hover:scale-95"
                          : darkMode
                          ? "bg-gray-600 group-hover:bg-gray-500"
                          : "bg-gray-300 group-hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
              {id === "strips" && (
                <div className="absolute inset-2 flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1/4 rounded-sm transition-all duration-200 ${
                        template === id
                          ? "bg-current opacity-20 group-hover:translate-x-1"
                          : darkMode
                          ? "bg-gray-600 group-hover:bg-gray-500"
                          : "bg-gray-300 group-hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
              {id === "collage" && (
                <div className="absolute inset-2 grid grid-cols-3 grid-rows-2 gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm transition-all duration-200 ${
                        template === id
                          ? "bg-current opacity-20 group-hover:rotate-1"
                          : darkMode
                          ? "bg-gray-600 group-hover:bg-gray-500"
                          : "bg-gray-300 group-hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
