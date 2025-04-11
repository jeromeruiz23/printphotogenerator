import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { jsPDF } from "jspdf";
import {
  ImagePlus,
  Printer,
  Download,
  Plus,
  Crop,
  Sun,
  Moon,
} from "lucide-react";
import type { PhotoSize, PaperSize, Layout, CropArea } from "./types";
import { defaultPaperSizes, defaultPhotoSizes } from "./constants/common";

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoSizes, setPhotoSizes] = useState<PhotoSize[]>(defaultPhotoSizes);
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>(defaultPaperSizes);
  const [selectedPhotoSize, setSelectedPhotoSize] = useState<PhotoSize>(
    photoSizes[0]
  );
  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>(
    paperSizes[0]
  );
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [showCustomPhotoForm, setShowCustomPhotoForm] = useState(false);
  const [showCustomPaperForm, setShowCustomPaperForm] = useState(false);
  const [customPhotoWidth, setCustomPhotoWidth] = useState("");
  const [customPhotoHeight, setCustomPhotoHeight] = useState("");
  const imageRef = useRef<HTMLImageElement>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);

  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [customPaperWidth, setCustomPaperWidth] = useState("");
  const [customPaperHeight, setCustomPaperHeight] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Add dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Add this after other function declarations
  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    setPreviewZoom((prev) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      return Math.min(Math.max(prev + delta, 0.5), 3); // Changed minimum zoom from 1 to 0.5
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingImage(true);
    setDragStartPos({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage) {
      // Calculate new position with boundaries to prevent image from moving too far
      const container = e.currentTarget as HTMLDivElement;
      const image = imageRef.current;

      if (!image) return;

      const newX = e.clientX - dragStartPos.x;
      const newY = e.clientY - dragStartPos.y;

      // Calculate boundaries
      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();

      // Allow some overflow but prevent complete image disappearance
      const minX = containerRect.width - imageRect.width * 1.5;
      const maxX = imageRect.width * 0.5;
      const minY = containerRect.height - imageRect.height * 1.5;
      const maxY = imageRect.height * 0.5;

      setImagePosition({
        x: Math.min(Math.max(newX, minX), maxX),
        y: Math.min(Math.max(newY, minY), maxY),
      });
    }
  };

  const addCustomPaperSize = () => {
    const width = parseFloat(customPaperWidth);
    const height = parseFloat(customPaperHeight);
    if (width > 0 && height > 0) {
      const newSize: PaperSize = {
        width,
        height,
        label: `Custom ${width}×${height}mm`,
        isCustom: true,
      };
      setPaperSizes([...paperSizes, newSize]);
      setSelectedPaperSize(newSize);
      setShowCustomPaperForm(false);
      setCustomPaperWidth("");
      setCustomPaperHeight("");
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImageAspectRatio(img.width / img.height);
        setSelectedImage(reader.result as string);
        setCropArea(null);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: false,
  });

  // Update the calculateLayout function
  const calculateLayout = (): Layout => {
    const padding = 2; // 2mm padding between photos
    const paperMargin = 10; // 10mm margin around paper edges

    // Calculate printable area with margins
    const printableWidth = selectedPaperSize.width - 2 * paperMargin;
    const printableHeight = selectedPaperSize.height - 2 * paperMargin;

    // Calculate number of photos that can fit considering padding
    const photosPerRow = Math.floor(
      (printableWidth + padding) / (selectedPhotoSize.width + padding)
    );
    const rows = Math.floor(
      (printableHeight + padding) / (selectedPhotoSize.height + padding)
    );

    return {
      photosPerRow,
      rows,
      total: photosPerRow * rows,
    };
  };

  const addCustomPhotoSize = () => {
    const width = parseFloat(customPhotoWidth);
    const height = parseFloat(customPhotoHeight);
    if (width > 0 && height > 0) {
      const newSize: PhotoSize = {
        width,
        height,
        label: `Custom ${width}×${height}mm`,
        isCustom: true,
      };
      setPhotoSizes([...photoSizes, newSize]);
      setSelectedPhotoSize(newSize);
      setShowCustomPhotoForm(false);
      setCustomPhotoWidth("");
      setCustomPhotoHeight("");
    }
  };

  useEffect(() => {
    if (selectedImage && imageRef.current) {
      const img = imageRef.current;

      // Calculate target aspect ratio from selected photo size (e.g., 4x6, 5x7)
      const targetAspectRatio =
        selectedPhotoSize.width / selectedPhotoSize.height;

      // Get actual image aspect ratio
      const imgAspectRatio = img.naturalWidth / img.naturalHeight;

      let cropWidth: number;
      let cropHeight: number;
      let x: number;
      let y: number;

      if (imgAspectRatio > targetAspectRatio) {
        // Image is too wide - crop from sides
        cropHeight = img.naturalHeight;
        cropWidth = cropHeight * targetAspectRatio;
        x = (img.naturalWidth - cropWidth) / 2; // Center horizontally
        y = 0;
      } else {
        // Image is too tall - crop from top/bottom
        cropWidth = img.naturalWidth;
        cropHeight = cropWidth / targetAspectRatio;
        x = 0;
        y = (img.naturalHeight - cropHeight) / 2; // Center vertically
      }

      setCropArea({ x, y, width: cropWidth, height: cropHeight });
    }
  }, [selectedImage, selectedPhotoSize]);
  const generatePDF = async () => {
    if (!selectedImage || !cropArea || !imageRef.current) return;

    const layout = calculateLayout();
    const padding = 2;
    const paperMargin = 10;

    const doc = new jsPDF({
      orientation:
        selectedPaperSize.width > selectedPaperSize.height
          ? "landscape"
          : "portrait",
      unit: "mm",
      format: [selectedPaperSize.width, selectedPaperSize.height],
    });

    // Create a canvas for cropping and resizing
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageElement = imageRef.current;
    const originalImageRect = imageElement.getBoundingClientRect();
    // const containerRect = imageElement.parentElement!.getBoundingClientRect();
    const scaleX =
      imageElement.naturalWidth / (originalImageRect.width / previewZoom);
    const scaleY =
      imageElement.naturalHeight / (originalImageRect.height / previewZoom);

    const adjustedCropArea = {
      x: cropArea.x - (imagePosition.x * scaleX) / previewZoom,
      y: cropArea.y - (imagePosition.y * scaleY) / previewZoom,
      width: cropArea.width / previewZoom,
      height: cropArea.height / previewZoom,
    };

    // Set canvas size to match the target photo size (in pixels)
    const scale = 10; // Scale up for better quality
    canvas.width = selectedPhotoSize.width * scale;
    canvas.height = selectedPhotoSize.height * scale;

    // Draw and resize the cropped portion
    ctx.drawImage(
      imageRef.current,
      adjustedCropArea.x,
      adjustedCropArea.y,
      adjustedCropArea.width,
      adjustedCropArea.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const resizedImageData = canvas.toDataURL("image/jpeg", 1.0);

    // Calculate total width and height with padding
    const totalWidthWithPadding =
      layout.photosPerRow * selectedPhotoSize.width +
      (layout.photosPerRow - 1) * padding;
    const totalHeightWithPadding =
      layout.rows * selectedPhotoSize.height + (layout.rows - 1) * padding;

    // Center the photos within the printable area
    const printableWidth = selectedPaperSize.width - 2 * paperMargin;
    const printableHeight = selectedPaperSize.height - 2 * paperMargin;
    const marginX = paperMargin + (printableWidth - totalWidthWithPadding) / 2;
    const marginY =
      paperMargin + (printableHeight - totalHeightWithPadding) / 2;

    // Place the photos
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.photosPerRow; col++) {
        const x = marginX + col * (selectedPhotoSize.width + padding);
        const y = marginY + row * (selectedPhotoSize.height + padding);

        // Add resized and cropped photo
        doc.addImage(
          resizedImageData,
          "JPEG",
          x,
          y,
          selectedPhotoSize.width,
          selectedPhotoSize.height,
          undefined,
          "FAST"
        );

        // Add dashed border - draw each side separately
        const dashLength = 2; // Length of each dash in mm
        const gapLength = 2; // Length of gaps between dashes in mm

        // Draw dashed lines for each side
        for (
          let i = 0;
          i < selectedPhotoSize.width;
          i += dashLength + gapLength
        ) {
          // Top border
          doc.line(
            x + i,
            y,
            x + Math.min(i + dashLength, selectedPhotoSize.width),
            y
          );
          // Bottom border
          doc.line(
            x + i,
            y + selectedPhotoSize.height,
            x + Math.min(i + dashLength, selectedPhotoSize.width),
            y + selectedPhotoSize.height
          );
        }

        for (
          let i = 0;
          i < selectedPhotoSize.height;
          i += dashLength + gapLength
        ) {
          // Left border
          doc.line(
            x,
            y + i,
            x,
            y + Math.min(i + dashLength, selectedPhotoSize.height)
          );
          // Right border
          doc.line(
            x + selectedPhotoSize.width,
            y + i,
            x + selectedPhotoSize.width,
            y + Math.min(i + dashLength, selectedPhotoSize.height)
          );
        }
      }
    }

    doc.save("photo-layout.pdf");
  };

  const layout = calculateLayout();

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center flex-1">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Photo Print Layout Generator
          </h1>
          <p className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Upload a photo, choose sizes, and generate a printable PDF
          </p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed bottom-4 right-4 p-2 rounded-full ${
            darkMode
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-white hover:bg-gray-100"
          } shadow-lg transition-colors duration-200`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </button>

        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg rounded-lg p-6 mb-6 transition-colors duration-200`}
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed ${
              darkMode
                ? "border-gray-600 hover:border-gray-500"
                : "border-gray-300 hover:border-gray-400"
            } rounded-lg p-6 text-center cursor-pointer transition-colors duration-200`}
          >
            <input {...getInputProps()} />
            <ImagePlus
              className={`mx-auto h-12 w-12 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {isDragActive
                ? "Drop the photo here..."
                : "Drag & drop a photo here, or click to select"}
            </p>
          </div>

          {selectedImage && (
            <div className="mt-4 relative" onWheel={handleWheelZoom}>
              <div
                className="overflow-hidden relative"
                style={{ height: "12rem" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={selectedImage}
                  alt="Preview"
                  className="max-h-none mx-auto object-contain transition-transform"
                  style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${previewZoom})`,
                    transformOrigin: "center",
                    cursor: isDraggingImage ? "grabbing" : "grab",
                  }}
                  draggable={false}
                />
                {cropArea && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="absolute border-2 border-indigo-500"
                      style={{
                        left: `${
                          (cropArea.x / imageRef.current!.naturalWidth) * 100
                        }%`,
                        top: `${
                          (cropArea.y / imageRef.current!.naturalHeight) * 100
                        }%`,
                        width: `${
                          (cropArea.width / imageRef.current!.naturalWidth) *
                          100
                        }%`,
                        height: `${
                          (cropArea.height / imageRef.current!.naturalHeight) *
                          100
                        }%`,
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                        zIndex: 10,
                        border: "2px dashed #6366f1",
                      }}
                    >
                      <div className="absolute -top-4 -right-4 bg-indigo-500 rounded-full p-1">
                        <Crop className="text-white" size={14} />
                      </div>
                      <div className="absolute inset-0 border-2 border-white border-dashed opacity-50" />
                    </div>
                  </div>
                )}
              </div>
              <div className="my-2 text-sm text-gray-500 text-center">
                Use mouse wheel to zoom in/out
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Photo Size
                  </label>
                  <div className="mt-1 flex gap-2">
                    <select
                      className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:border-indigo-500 transition-colors duration-200`}
                      value={selectedPhotoSize.label}
                      onChange={(e) =>
                        setSelectedPhotoSize(
                          photoSizes.find(
                            (size) => size.label === e.target.value
                          ) || photoSizes[0]
                        )
                      }
                    >
                      {photoSizes.map((size) => (
                        <option key={size.label} value={size.label}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCustomPhotoForm(true)}
                      className={`px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        darkMode
                          ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {showCustomPhotoForm && (
                    <div className="mt-2 p-4 border rounded-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Width (mm)
                          </label>
                          <input
                            type="number"
                            value={customPhotoWidth}
                            onChange={(e) =>
                              setCustomPhotoWidth(e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Height (mm)
                          </label>
                          <input
                            type="number"
                            value={customPhotoHeight}
                            onChange={(e) =>
                              setCustomPhotoHeight(e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setShowCustomPhotoForm(false)}
                          className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addCustomPhotoSize}
                          className="px-2 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Paper Size
                  </label>
                  <div className="mt-1 flex gap-2">
                    <select
                      className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:border-indigo-500 transition-colors duration-200`}
                      value={selectedPaperSize.label}
                      onChange={(e) =>
                        setSelectedPaperSize(
                          paperSizes.find(
                            (size) => size.label === e.target.value
                          ) || paperSizes[0]
                        )
                      }
                    >
                      {paperSizes.map((size) => (
                        <option key={size.label} value={size.label}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCustomPaperForm(true)}
                      className={`px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        darkMode
                          ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {showCustomPaperForm && (
                    <div className="mt-2 p-4 border rounded-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Width (mm)
                          </label>
                          <input
                            type="number"
                            value={customPaperWidth}
                            onChange={(e) =>
                              setCustomPaperWidth(e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">
                            Height (mm)
                          </label>
                          <input
                            type="number"
                            value={customPaperHeight}
                            onChange={(e) =>
                              setCustomPaperHeight(e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setShowCustomPaperForm(false)}
                          className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addCustomPaperSize}
                          className="px-2 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {selectedImage && (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div
                className={`mt-6 p-4 rounded-md ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                } transition-colors duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Printer
                      className={`h-5 w-5 mr-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Layout Preview:
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {layout.total} photos ({layout.photosPerRow} × {layout.rows}
                    )
                  </span>
                </div>

                <div className="mt-4 bg-white border rounded-lg overflow-hidden">
                  <div
                    className="relative bg-gray-100"
                    style={{
                      width: "100%",
                      paddingTop: `${
                        (selectedPaperSize.height / selectedPaperSize.width) *
                        100
                      }%`,
                    }}
                  >
                    {/* Paper preview container */}
                    <div className="absolute inset-0 m-4 bg-white shadow-inner">
                      {/* Generate preview boxes for each photo position */}
                      {Array.from({ length: layout.rows }).map((_, row) =>
                        Array.from({ length: layout.photosPerRow }).map(
                          (_, col) => {
                            // Calculate position percentages
                            const padding = 2; // 2mm padding
                            const totalWidth = selectedPaperSize.width;
                            const totalHeight = selectedPaperSize.height;

                            const photoWidth =
                              (selectedPhotoSize.width / totalWidth) * 100;
                            const photoHeight =
                              (selectedPhotoSize.height / totalHeight) * 100;
                            const spacingX = (padding / totalWidth) * 100;
                            const spacingY = (padding / totalHeight) * 100;

                            const totalWidthWithPadding =
                              layout.photosPerRow * photoWidth +
                              (layout.photosPerRow - 1) * spacingX;
                            const totalHeightWithPadding =
                              layout.rows * photoHeight +
                              (layout.rows - 1) * spacingY;

                            // Calculate positions
                            const marginX =
                              ((totalWidth -
                                (totalWidthWithPadding * totalWidth) / 100) /
                                2 /
                                totalWidth) *
                              100;
                            const marginY =
                              ((totalHeight -
                                (totalHeightWithPadding * totalHeight) / 100) /
                                2 /
                                totalHeight) *
                              100;
                            const left =
                              marginX + col * (photoWidth + spacingX);
                            const top =
                              marginY + row * (photoHeight + spacingY);

                            return (
                              <div
                                key={`${row}-${col}`}
                                className="absolute border-2 border-dashed border-gray-300 overflow-hidden"
                                style={{
                                  left: `${left}%`,
                                  top: `${top}%`,
                                  width: `${photoWidth}%`,
                                  height: `${photoHeight}%`,
                                }}
                              >
                                {selectedImage && cropArea && (
                                  <div
                                    className="w-full h-full bg-contain bg-center bg-no-repeat"
                                    style={{
                                      backgroundImage: `url(${selectedImage})`,
                                      backgroundSize: "cover",
                                      opacity: 0.7,
                                    }}
                                  />
                                )}
                              </div>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={generatePDF}
              disabled={!selectedImage}
              className={`w-full flex justify-center items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${
                !selectedImage
                  ? "bg-gray-300 cursor-not-allowed"
                  : darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <Download className="h-5 w-5 mr-2" />
              Generate PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
