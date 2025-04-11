import React, { useRef, useState, useEffect } from "react";
import { Crop, ZoomIn, ZoomOut, Move } from "lucide-react";
import { CropArea, ImageData } from "../types";

interface ImagePreviewProps {
  image: ImageData;
  cropArea: CropArea | null;
  onPositionChange: (position: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  darkMode: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  cropArea,
  onPositionChange,
  onZoomChange,
  darkMode,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
    null
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingImage(true);
    setDragStartPos({
      x: e.clientX - image.position.x,
      y: e.clientY - image.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage) {
      const container = e.currentTarget as HTMLDivElement;
      const image = imageRef.current;

      if (!image) return;

      const newX = e.clientX - dragStartPos.x;
      const newY = e.clientY - dragStartPos.y;

      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();

      const minX = containerRect.width - imageRect.width * 1.5;
      const maxX = imageRect.width * 0.5;
      const minY = containerRect.height - imageRect.height * 1.5;
      const maxY = imageRect.height * 0.5;

      onPositionChange({
        x: Math.min(Math.max(newX, minX), maxX),
        y: Math.min(Math.max(newY, minY), maxY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingImage(false);
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(image.zoom + delta, 0.5), 3);
    onZoomChange(newZoom);
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createTouchStartHandler = () => (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        setLastTouchDistance(distance);
      } else if (e.touches.length === 1) {
        setIsDraggingImage(true);
        setDragStartPos({
          x: e.touches[0].clientX - image.position.x,
          y: e.touches[0].clientY - image.position.y,
        });
      }
    };

    const createTouchMoveHandler = () => (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (lastTouchDistance !== null) {
          const delta = distance - lastTouchDistance;
          const zoomDelta = (delta / 200) * image.zoom;
          const newZoom = Math.min(Math.max(image.zoom + zoomDelta, 0.5), 3);
          onZoomChange(newZoom);
        }

        setLastTouchDistance(distance);
      } else if (e.touches.length === 1 && isDraggingImage) {
        const image = imageRef.current;
        if (!image) return;

        const newX = e.touches[0].clientX - dragStartPos.x;
        const newY = e.touches[0].clientY - dragStartPos.y;

        const containerRect = container.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        const minX = containerRect.width - imageRect.width * 1.5;
        const maxX = imageRect.width * 0.5;
        const minY = containerRect.height - imageRect.height * 1.5;
        const maxY = imageRect.height * 0.5;

        onPositionChange({
          x: Math.min(Math.max(newX, minX), maxX),
          y: Math.min(Math.max(newY, minY), maxY),
        });
      }
    };

    const handleTouchEnd = () => {
      setIsDraggingImage(false);
      setLastTouchDistance(null);
    };

    const touchStart = createTouchStartHandler();
    const touchMove = createTouchMoveHandler();

    container.addEventListener("touchstart", touchStart);
    container.addEventListener("touchmove", touchMove);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", touchStart);
      container.removeEventListener("touchmove", touchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    image.position,
    image.zoom,
    isDraggingImage,
    dragStartPos,
    lastTouchDistance,
    onPositionChange,
    onZoomChange,
  ]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-lg ${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        } touch-none`}
        style={{ height: "16rem" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheelZoom}
      >
        <img
          ref={imageRef}
          src={image.dataUrl}
          alt="Preview"
          className={`max-h-none mx-auto object-contain transition-all duration-200 ${
            isDraggingImage ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            transform: `translate(${image.position.x}px, ${image.position.y}px) scale(${image.zoom})`,
            transformOrigin: "center",
            willChange: "transform",
          }}
          draggable={false}
        />
        {cropArea && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="absolute border-2 border-dashed border-indigo-500"
              style={{
                left: `${(cropArea.x / imageRef.current!.naturalWidth) * 100}%`,
                top: `${(cropArea.y / imageRef.current!.naturalHeight) * 100}%`,
                width: `${
                  (cropArea.width / imageRef.current!.naturalWidth) * 100
                }%`,
                height: `${
                  (cropArea.height / imageRef.current!.naturalHeight) * 100
                }%`,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                zIndex: 10,
              }}
            >
              <div
                className={`absolute -top-4 -right-4 p-1.5 rounded-full ${
                  darkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <Crop
                  className={darkMode ? "text-white" : "text-black"}
                  size={14}
                />
              </div>
            </div>
          </div>
        )}

        <div
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 rounded-lg shadow-lg backdrop-blur-sm ${
            darkMode ? "bg-gray-800/90" : "bg-white/90"
          }`}
        >
          <button
            onClick={() => handleZoom(-0.1)}
            className={`p-2 rounded-md transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-white"
                : "hover:bg-gray-100 text-black"
            }`}
          >
            <ZoomOut size={16} />
          </button>
          <span
            className={`text-sm font-medium ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            {Math.round(image.zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className={`p-2 rounded-md transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-white"
                : "hover:bg-gray-100 text-black"
            }`}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div
        className={`flex items-center justify-center gap-2 text-sm ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        <Move size={14} />
        <span className="hidden xs:inline">Drag to pan</span>
        <span className="xs:hidden">Touch to pan</span>
        <span className="mx-2">•</span>
        <ZoomIn size={14} />
        <span className="hidden xs:inline">Scroll to zoom</span>
        <span className="xs:hidden">Pinch to zoom</span>
      </div>
    </div>
  );
};
