import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2 } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  darkMode: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  darkMode,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate file sizes
        const maxSize = 10 * 1024 * 1024; // 10MB
        const invalidFiles = acceptedFiles.filter(
          (file) => file.size > maxSize
        );
        if (invalidFiles.length > 0) {
          throw new Error("Some files exceed the 10MB size limit");
        }

        // Validate image dimensions
        await Promise.all(
          acceptedFiles.map(
            (file) =>
              new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                  if (img.width < 100 || img.height < 100) {
                    reject(
                      new Error(
                        "Image dimensions must be at least 100x100 pixels"
                      )
                    );
                  }
                  resolve(null);
                };
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = URL.createObjectURL(file);
              })
          )
        );

        onUpload(acceptedFiles);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process images"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: true,
  });

  return (
    <div>
      <Tooltip text="Press Ctrl+O to open file picker">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 group
            ${
              error
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : darkMode
                ? "border-gray-700 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800"
                : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
            }
            ${
              isDragActive
                ? "scale-102 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : ""
            }`}
        >
          <input {...getInputProps()} />
          <div
            className={`transition-transform duration-200 ${
              isDragActive ? "scale-110" : "group-hover:scale-105"
            }`}
          >
            {isLoading ? (
              <Loader2
                className={`mx-auto h-12 w-12 animate-spin ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            ) : (
              <ImagePlus
                className={`mx-auto h-12 w-12 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            )}
            <p
              className={`mt-4 text-sm font-medium ${
                error
                  ? "text-red-600 dark:text-red-400"
                  : darkMode
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              {error
                ? error
                : isDragActive
                ? "Drop the photos here..."
                : "Drag & drop photos here, or click to select"}
            </p>
          </div>
        </div>
      </Tooltip>
      {!error && (
        <p
          className={`mt-2 text-xs ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Supported formats: JPEG, JPG, PNG (max 10MB)
        </p>
      )}
    </div>
  );
};
