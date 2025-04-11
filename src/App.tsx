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
  X,
  Grid,
  Layout as LayoutIcon,
} from "lucide-react";
import type {
  PhotoSize,
  PaperSize,
  Layout,
  CropArea,
  LayoutType,
  PhotoboothTemplate,
} from "./types";
import { defaultPaperSizes, defaultPhotoSizes } from "./constants/common";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

function App() {
  const [photoSizes, setPhotoSizes] = useState<PhotoSize[]>(defaultPhotoSizes);
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>(defaultPaperSizes);
  const [layoutType, setLayoutType] = useState<LayoutType>("grid");
  const [photoboothTemplate, setPhotoboothTemplate] =
    useState<PhotoboothTemplate>("classic");
  const [selectedPhotoSize, setSelectedPhotoSize] = useState<PhotoSize>(
    photoSizes[0]
  );
  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>(
    paperSizes[0]
  );
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [showCustomPhotoForm, setShowCustomPhotoForm] = useState(false);
  const [showCustomPaperForm, setShowCustomPaperForm] = useState(false);
  const [customPhotoWidth, setCustomPhotoWidth] = useState("");
  const [customPhotoHeight, setCustomPhotoHeight] = useState("");
  const imageRef = useRef<HTMLImageElement>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [previewBackground, setPreviewBackground] = useState<"white" | "black">(
    "white"
  );

  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [customPaperWidth, setCustomPaperWidth] = useState("");
  const [customPaperHeight, setCustomPaperHeight] = useState("");
  const [images, setImages] = useState<
    Array<{
      id: string;
      dataUrl: string;
      cropArea: CropArea | null;
      position: { x: number; y: number };
      zoom: number;
    }>
  >([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const imageAspectRatio = img.width / img.height;
            const newImage = {
              id: Math.random().toString(36).substr(2, 9),
              dataUrl: reader.result as string,
              cropArea: null,
              position: { x: 0, y: 0 },
              zoom: 1,
              aspectRatio: imageAspectRatio,
            };

            setImages((prev) => [...prev, newImage]);
            if (!selectedImageId) {
              setSelectedImageId(newImage.id);
            }
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    },
    [selectedImageId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: true,
  });

  const ImageSelector = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const imagesPerPage = 6;
    const totalPages = Math.ceil(images.length / imagesPerPage);

    const currentImages = images.slice(
      currentPage * imagesPerPage,
      (currentPage + 1) * imagesPerPage
    );

    const handlePrevPage = () => {
      setCurrentPage((prev) => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const handleDragEnd = (result: DropResult) => {
      if (!result.destination) return;

      const newImages = Array.from(images);
      const [reorderedItem] = newImages.splice(result.source.index, 1);
      newImages.splice(result.destination.index, 0, reorderedItem);

      setImages(newImages);
    };

    const handleRemoveImage = (imageId: string) => {
      const newImages = images.filter((img) => img.id !== imageId);
      setImages(newImages);

      // Clear states if no images remain
      if (newImages.length === 0) {
        setSelectedImageId(null);
        setCropArea(null);
        setPreviewZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setIsDraggingImage(false);
        setDragStartPos({ x: 0, y: 0 });
      } else if (selectedImageId === imageId) {
        // If the removed image was selected, select the first remaining image
        setSelectedImageId(newImages[0].id);
      }
    };
    useEffect(() => {
      if (images.length === 0) {
        setSelectedImageId(null);
        setCropArea(null);
        setPreviewZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setIsDraggingImage(false);
        setDragStartPos({ x: 0, y: 0 });
      }
    });

    return (
      <div className="relative flex items-center justify-center mb-4">
        {images.length > imagesPerPage && (
          <button
            onClick={handlePrevPage}
            className={`absolute left-0 p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-white hover:bg-gray-100 text-gray-600"
            } shadow-md transition-colors duration-200`}
            disabled={currentPage === 0}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="imageList" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-2 justify-center items-center mx-16 p-2 rounded-lg transition-colors duration-200 ${
                  snapshot.isDraggingOver
                    ? darkMode
                      ? "bg-gray-700"
                      : "bg-gray-100"
                    : "bg-transparent"
                }`}
              >
                {currentImages.map((image, index) => (
                  <Draggable
                    key={image.id}
                    draggableId={image.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative group transition-transform ${
                          snapshot.isDragging ? "scale-105" : ""
                        }`}
                      >
                        <img
                          src={image.dataUrl}
                          alt={`Image ${index + 1}`}
                          className={`w-20 h-20 object-cover rounded-lg cursor-move
                            ${
                              selectedImageId === image.id
                                ? "ring-2 ring-blue-500"
                                : ""
                            }
                            ${
                              snapshot.isDragging ? "opacity-75 shadow-lg" : ""
                            }`}
                          onClick={() => setSelectedImageId(image.id)}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Stop event propagation
                            handleRemoveImage(image.id);
                          }}
                          className={`absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full 
    ${
      darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
    } 
    shadow-md
    opacity-0 group-hover:opacity-100 transition-opacity duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
    pointer-events-auto`} // Add pointer-events-auto
                          aria-label="Remove image"
                        >
                          <X
                            className={`w-3 h-3 ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {images.length > imagesPerPage && (
          <button
            onClick={handleNextPage}
            className={`absolute right-0 p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-white hover:bg-gray-100 text-gray-600"
            } shadow-md transition-colors duration-200`}
            disabled={
              currentPage >= Math.ceil(images.length / imagesPerPage) - 1
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    );
  };

  const calculateLayout = (): Layout => {
    const defaultPadding = 2; // Default padding for grid layout
    const photoboothPadding = 10; // Larger padding for photobooth layout
    const paperMargin = 10; // 10mm margin around paper edges

    // Calculate printable area with margins
    const printableWidth = selectedPaperSize.width - 2 * paperMargin;
    const printableHeight = selectedPaperSize.height - 2 * paperMargin;

    if (layoutType === "photobooth") {
      const padding = photoboothPadding; // Use larger padding for photobooth
      switch (photoboothTemplate) {
        case "classic":
          return {
            photosPerRow: 2,
            rows: 2,
            total: 4,
            type: "photobooth",
            template: "classic",
            padding: padding,
          };
        case "strips":
          return {
            photosPerRow: 1,
            rows: 4,
            total: 4,
            type: "photobooth",
            template: "strips",
            padding: padding,
          };
        case "collage":
          return {
            photosPerRow: 3,
            rows: 2,
            total: 6,
            type: "photobooth",
            template: "collage",
            padding: padding,
          };
      }
    }

    // Default grid layout
    const photosPerRow = Math.floor(
      (printableWidth + defaultPadding) /
        (selectedPhotoSize.width + defaultPadding)
    );
    const rows = Math.floor(
      (printableHeight + defaultPadding) /
        (selectedPhotoSize.height + defaultPadding)
    );

    return {
      photosPerRow,
      rows,
      total: photosPerRow * rows,
      type: "grid",
      padding: defaultPadding,
    };
  };

  const LayoutTypeSelector = () => (
    <div className="mb-4">
      <label
        className={`block text-sm font-medium mb-2 ${
          darkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        Layout Type
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => setLayoutType("grid")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
            layoutType === "grid"
              ? "bg-indigo-600 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <Grid size={16} />
          Grid
        </button>
        <button
          onClick={() => setLayoutType("photobooth")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
            layoutType === "photobooth"
              ? "bg-indigo-600 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <LayoutIcon size={16} />
          Photo Booth
        </button>
      </div>
    </div>
  );

  const PhotoboothTemplateSelector = () => (
    <div className="mb-4">
      <label
        className={`block text-sm font-medium mb-2 ${
          darkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        Photobooth Template
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setPhotoboothTemplate("classic")}
          className={`flex flex-col items-center p-3 rounded-md ${
            photoboothTemplate === "classic"
              ? "bg-indigo-600 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div className="w-6 h-6 bg-current opacity-20 rounded"></div>
            <div className="w-6 h-6 bg-current opacity-20 rounded"></div>
            <div className="w-6 h-6 bg-current opacity-20 rounded"></div>
            <div className="w-6 h-6 bg-current opacity-20 rounded"></div>
          </div>
          Classic
        </button>
        <button
          onClick={() => setPhotoboothTemplate("strips")}
          className={`flex flex-col items-center p-3 rounded-md ${
            photoboothTemplate === "strips"
              ? "bg-indigo-600 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <div className="flex flex-col gap-1 mb-2">
            <div className="w-4 h-6 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-6 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-6 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-6 bg-current opacity-20 rounded"></div>
          </div>
          Strips
        </button>
        <button
          onClick={() => setPhotoboothTemplate("collage")}
          className={`flex flex-col items-center p-3 rounded-md ${
            photoboothTemplate === "collage"
              ? "bg-indigo-600 text-white"
              : darkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <div className="grid grid-cols-3 gap-1 mb-2">
            <div className="w-4 h-4 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-4 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-4 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-4 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-4 bg-current opacity-20 rounded"></div>
            <div className="w-4 h-4 bg-current opacity-20 rounded"></div>
          </div>
          Collage
        </button>
      </div>
    </div>
  );

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
    if (selectedImageId && imageRef.current) {
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
  }, [selectedImageId, selectedPhotoSize]);

  const generatePDF = async () => {
    if (images.length === 0) return;

    const layout = calculateLayout();
    const padding = layout.padding;
    const paperMargin = 10;

    const doc = new jsPDF({
      orientation:
        selectedPaperSize.width > selectedPaperSize.height
          ? "landscape"
          : "portrait",
      unit: "mm",
      format: [selectedPaperSize.width, selectedPaperSize.height],
    });

    // Set background color for the whole page
    if (previewBackground === "black") {
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, selectedPaperSize.width, selectedPaperSize.height, "F");
    }

    // Calculate centering margins for the page
    const totalWidthWithPadding =
      layout.photosPerRow * selectedPhotoSize.width +
      (layout.photosPerRow - 1) * padding;
    const totalHeightWithPadding =
      layout.rows * selectedPhotoSize.height + (layout.rows - 1) * padding;
    const printableWidth = selectedPaperSize.width - 2 * paperMargin;
    const printableHeight = selectedPaperSize.height - 2 * paperMargin;
    const marginX = paperMargin + (printableWidth - totalWidthWithPadding) / 2;
    const marginY =
      paperMargin + (printableHeight - totalHeightWithPadding) / 2;

    // Process photos for the page
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.photosPerRow; col++) {
        const currentImage =
          layout.type === "photobooth"
            ? images[0]
            : images[(row * layout.photosPerRow + col) % images.length];

        const x = marginX + col * (selectedPhotoSize.width + padding);
        const y = marginY + row * (selectedPhotoSize.height + padding);

        // Create temporary canvas for the current image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Set canvas size to match the target photo size
        const scale = 10; // Scale up for better quality
        canvas.width = selectedPhotoSize.width * scale;
        canvas.height = selectedPhotoSize.height * scale;

        // Create temporary image element
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = currentImage.dataUrl;
        });

        // Calculate crop area and position adjustments for this image
        const originalRect = img.width / img.height;
        const targetAspectRatio =
          selectedPhotoSize.width / selectedPhotoSize.height;
        let cropArea;

        if (originalRect > targetAspectRatio) {
          const cropWidth = img.height * targetAspectRatio;
          cropArea = {
            x: (img.width - cropWidth) / 2,
            y: 0,
            width: cropWidth,
            height: img.height,
          };
        } else {
          const cropHeight = img.width / targetAspectRatio;
          cropArea = {
            x: 0,
            y: (img.height - cropHeight) / 2,
            width: img.width,
            height: cropHeight,
          };
        }

        // Draw and crop image
        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Add image to PDF
        const imageData = canvas.toDataURL("image/jpeg", 1.0);
        doc.addImage(
          imageData,
          "JPEG",
          x,
          y,
          selectedPhotoSize.width,
          selectedPhotoSize.height,
          undefined,
          "FAST"
        );

        // Set border color based on background
        doc.setDrawColor(previewBackground === "black" ? 255 : 0);

        if (layout.type === "photobooth") {
          // Draw solid borders for photobooth layout
          doc.line(x, y, x + selectedPhotoSize.width, y); // top
          doc.line(
            x,
            y + selectedPhotoSize.height,
            x + selectedPhotoSize.width,
            y + selectedPhotoSize.height
          ); // bottom
          doc.line(x, y, x, y + selectedPhotoSize.height); // left
          doc.line(
            x + selectedPhotoSize.width,
            y,
            x + selectedPhotoSize.width,
            y + selectedPhotoSize.height
          ); // right
        } else {
          // Draw dashed borders for grid layout
          const dashLength = 2;
          const gapLength = 2;

          for (
            let i = 0;
            i < selectedPhotoSize.width;
            i += dashLength + gapLength
          ) {
            doc.line(
              x + i,
              y,
              x + Math.min(i + dashLength, selectedPhotoSize.width),
              y
            );
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
            doc.line(
              x,
              y + i,
              x,
              y + Math.min(i + dashLength, selectedPhotoSize.height)
            );
            doc.line(
              x + selectedPhotoSize.width,
              y + i,
              x + selectedPhotoSize.width,
              y + Math.min(i + dashLength, selectedPhotoSize.height)
            );
          }
        }
      }
    }

    doc.save(
      layout.type === "photobooth" ? "photobooth.pdf" : "photo-layout.pdf"
    );
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
          {images.length > 0 && (
            <div className="mt-4">
              <ImageSelector />
              {selectedImageId && (
                <div className="relative" onWheel={handleWheelZoom}>
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
                      src={
                        images.find((img) => img.id === selectedImageId)
                          ?.dataUrl
                      }
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
                              (cropArea.x / imageRef.current!.naturalWidth) *
                              100
                            }%`,
                            top: `${
                              (cropArea.y / imageRef.current!.naturalHeight) *
                              100
                            }%`,
                            width: `${
                              (cropArea.width /
                                imageRef.current!.naturalWidth) *
                              100
                            }%`,
                            height: `${
                              (cropArea.height /
                                imageRef.current!.naturalHeight) *
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

                  <div className="grid grid-cols-1 gap-6">
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
          )}
        </div>
        {selectedImageId && (
          <>
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg rounded-lg p-6 mb-6 transition-colors duration-200`}
            >
              <LayoutTypeSelector />
              {layoutType === "photobooth" && <PhotoboothTemplateSelector />}
              <div className="mt-6">
                {/* Preview Card */}
                <div
                  className={`p-4 rounded-md ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center justify-between mb-4">
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
                    <button
                      onClick={() =>
                        setPreviewBackground((prev) =>
                          prev === "white" ? "black" : "white"
                        )
                      }
                      className={`px-3 py-1 rounded-md text-sm ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Background:{" "}
                      {previewBackground === "white" ? "White" : "Black"}
                    </button>
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
                      <div
                        className={`absolute inset-0 m-4 ${
                          previewBackground === "black"
                            ? "bg-black"
                            : "bg-white"
                        } shadow-inner`}
                      >
                        {/* Generate preview boxes for each photo position */}
                        {Array.from({ length: layout.rows }).map((_, row) =>
                          Array.from({ length: layout.photosPerRow }).map(
                            (_, col) => {
                              const imageIndex =
                                row * layout.photosPerRow + col;
                              const image = images[imageIndex % images.length];

                              const padding = layout.padding;
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

                              const marginX =
                                ((totalWidth -
                                  (totalWidthWithPadding * totalWidth) / 100) /
                                  2 /
                                  totalWidth) *
                                100;
                              const marginY =
                                ((totalHeight -
                                  (totalHeightWithPadding * totalHeight) /
                                    100) /
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
                                  className={`absolute ${
                                    layoutType === "photobooth"
                                      ? "border border-solid"
                                      : "border-2 border-dashed"
                                  } ${
                                    darkMode
                                      ? "border-gray-600"
                                      : "border-gray-300"
                                  } overflow-hidden`}
                                  style={{
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${photoWidth}%`,
                                    height: `${photoHeight}%`,
                                  }}
                                >
                                  {image && (
                                    <div
                                      className="w-full h-full bg-contain bg-center bg-no-repeat"
                                      style={{
                                        backgroundImage: `url(${image.dataUrl})`,
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
            </div>
            <button
              onClick={generatePDF}
              disabled={images.length === 0}
              className={`w-full flex justify-center items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${
                images.length === 0
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
