import React, { useState } from "react";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { Layout, ImageData, PhotoSize, PaperSize } from "../types";
import { generatePDF } from "../utils/pdfGenerator";
import { Tooltip } from "./Tooltip";

interface LayoutPreviewProps {
  images: ImageData[];
  layout: Layout;
  selectedPhotoSize: PhotoSize;
  selectedPaperSize: PaperSize;
  previewBackground: "white" | "black";
  onBackgroundChange: (bg: "white" | "black") => void;
  darkMode: boolean;
}

const getImagesPerPage = (layout: Layout) => {
  return layout.rows * layout.photosPerRow;
};

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  images,
  layout,
  selectedPhotoSize,
  selectedPaperSize,
  previewBackground,
  onBackgroundChange,
  darkMode,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const imagesPerPage = getImagesPerPage(layout);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getPageImages = (page: number) => {
    const startIndex = page * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    return images.slice(startIndex, endIndex);
  };
  const handleGeneratePDF = () => {
    generatePDF(
      images,
      layout,
      selectedPhotoSize,
      selectedPaperSize,
      previewBackground
    );
  };

  const getImageForPosition = (imageIndex: number) => {
    const pageImages = getPageImages(currentPage);
    return pageImages[imageIndex] || null;
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900" : "bg-white"
      } shadow-xl rounded-lg p-6 mb-6 backdrop-blur-sm bg-opacity-95`}
    >
      <div className="mt-2">
        <div
          className={`p-6 rounded-lg ${
            darkMode ? "bg-gray-800/70" : "bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Printer
                className={`h-5 w-5 mr-3 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Layout Preview
              </span>
            </div>
            <button
              onClick={() =>
                onBackgroundChange(
                  previewBackground === "white" ? "black" : "white"
                )
              }
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
            >
              Background: {previewBackground === "white" ? "White" : "Black"}
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border shadow-inner transition-all duration-200">
            <div
              className="relative bg-gradient-to-br from-gray-100 to-gray-200"
              style={{
                width: "100%",
                paddingTop: `${
                  (selectedPaperSize.height / selectedPaperSize.width) * 100
                }%`,
              }}
            >
              <div
                className={`absolute inset-0 m-4 rounded-md shadow-md transition-colors duration-200 ${
                  previewBackground === "black" ? "bg-black" : "bg-white"
                }`}
              >
                {Array.from({ length: layout.rows }).map((_, row) =>
                  Array.from({ length: layout.photosPerRow }).map((_, col) => {
                    const imageIndex = row * layout.photosPerRow + col;
                    const image = getImageForPosition(imageIndex);
                    if (!image) return null;

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
                      layout.rows * photoHeight + (layout.rows - 1) * spacingY;

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

                    const left = marginX + col * (photoWidth + spacingX);
                    const top = marginY + row * (photoHeight + spacingY);

                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`absolute border-2 border-dashed ${
                          darkMode ? "border-gray-700" : "border-gray-300"
                        } overflow-hidden hover:opacity-90`}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${photoWidth}%`,
                          height: `${photoHeight}%`,
                        }}
                      >
                        {image && (
                          <div
                            className="w-full h-full bg-contain bg-center bg-no-repeat transform transition-transform duration-200 hover:scale-105"
                            style={{
                              backgroundImage: `url(${image.dataUrl})`,
                              backgroundSize: "cover",
                              opacity: 0.8,
                              transform: `scale(${image.zoom})`,
                              transformOrigin: "center",
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tooltip text="Press Ctrl+P to generate PDF">
        <button
          onClick={handleGeneratePDF}
          disabled={images.length === 0}
          className={`w-full flex justify-center items-center px-6 py-3 mt-6 rounded-lg text-sm font-medium transition-all duration-200 ${
            images.length === 0
              ? "bg-gray-300 cursor-not-allowed opacity-50"
              : darkMode
              ? "bg-white text-black hover:bg-gray-200 active:bg-gray-300 shadow-white/25"
              : "bg-black text-white hover:bg-gray-800 active:bg-gray-700"
          } shadow-lg hover:shadow-xl active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
        >
          Generate PDF
        </button>
      </Tooltip>

      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
            disabled={currentPage === 0}
            className={`p-2 rounded-full ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-200"
            } transition-colors duration-200 ${
              currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span
            className={`text-sm font-medium ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
            className={`p-2 rounded-full ${
              darkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-200"
            } transition-colors duration-200 ${
              currentPage === totalPages - 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
