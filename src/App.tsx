import { useState, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import {
  ImageUploader,
  ImageSelector,
  ImagePreview,
  SizeSelector,
  LayoutPreview,
  LayoutCustomizer,
  Tooltip,
} from "./components";
import {
  useImages,
  useSizes,
  useDarkMode,
  useKeyboardShortcuts,
} from "./hooks";
import { calculateLayout } from "./utils/layoutCalculator";
import { ImageData } from "./types";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const {
    images,
    selectedImageId,
    setSelectedImageId,
    addImages,
    removeImage,
    updateImagePosition,
    updateImageZoom,
    reorderImages,
  } = useImages();
  const {
    photoSizes,
    paperSizes,
    selectedPhotoSize,
    selectedPaperSize,
    setSelectedPhotoSize,
    setSelectedPaperSize,
    addCustomPhotoSize,
    addCustomPaperSize,
    deleteCustomPhotoSize,
    deleteCustomPaperSize,
  } = useSizes();
  const [previewBackground, setPreviewBackground] = useState<"white" | "black">(
    "white"
  );
  const [layoutOptions, setLayoutOptions] = useState({});

  const layout = calculateLayout(
    selectedPhotoSize,
    selectedPaperSize,
    layoutOptions
  );
  const selectedImage = images.find(
    (img: ImageData) => img.id === selectedImageId
  );

  useKeyboardShortcuts([
    {
      key: "o",
      ctrl: true,
      action: () => fileInputRef.current?.click(),
    },
    {
      key: "p",
      ctrl: true,
      action: () => {
        if (images.length > 0) {
          const layoutPreviewElement = document.querySelector(
            'button:contains("Generate PDF")'
          );
          if (layoutPreviewElement instanceof HTMLElement) {
            layoutPreviewElement.click();
          }
        }
      },
    },
    {
      key: "d",
      ctrl: true,
      action: toggleDarkMode,
    },
    {
      key: "Delete",
      action: () => {
        if (selectedImageId) {
          removeImage(selectedImageId);
        }
      },
    },
    {
      key: "Escape",
      action: () => setSelectedImageId(null),
    },
  ]);

  return (
    <div
      className={`min-h-screen transition-all duration-200 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            addImages(files);
            e.target.value = "";
          }
        }}
      />

      <div className="max-w-[96rem] mx-auto px-4 xs:px-6 sm:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center animate-fade-in mb-8 sm:mb-12">
          <h1
            className={`text-3xl xs:text-4xl font-bold tracking-tight ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            Photo Print Layout Generator
          </h1>
          <p
            className={`mt-3 text-base xs:text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Upload photos, choose sizes, and generate printable PDFs
          </p>
        </div>

        <div
          className={`space-y-6 lg:space-y-0 ${
            images.length > 0 ? "lg:grid lg:grid-cols-2 lg:gap-8" : ""
          }`}
        >
          {/* Left column - Upload and Image Controls */}
          <div
            className={`transition-all duration-500 ${
              images.length > 0 ? "animate-scale-in" : ""
            }`}
          >
            <div
              className={`${
                darkMode ? "bg-gray-900" : "bg-white"
              } rounded-2xl shadow-xl overflow-hidden transition-all duration-200`}
            >
              <div className="p-4 xs:p-6 lg:p-8">
                <ImageUploader onUpload={addImages} darkMode={darkMode} />

                {images.length > 0 && (
                  <div className="mt-6 xs:mt-8 space-y-6 xs:space-y-8 animate-slide-up">
                    <ImageSelector
                      images={images}
                      selectedImageId={selectedImageId}
                      onImageSelect={setSelectedImageId}
                      onImageRemove={removeImage}
                      onImagesReorder={reorderImages}
                      darkMode={darkMode}
                    />

                    {selectedImage && (
                      <>
                        <ImagePreview
                          image={selectedImage}
                          cropArea={selectedImage.cropArea}
                          onPositionChange={(pos) =>
                            updateImagePosition(selectedImage.id, pos)
                          }
                          onZoomChange={(zoom) =>
                            updateImageZoom(selectedImage.id, zoom)
                          }
                          darkMode={darkMode}
                        />

                        <div className="space-y-6">
                          <SizeSelector
                            label="Photo Size"
                            sizes={photoSizes}
                            selectedSize={selectedPhotoSize}
                            onSizeSelect={setSelectedPhotoSize}
                            onCustomSizeAdd={addCustomPhotoSize}
                            onCustomSizeDelete={deleteCustomPhotoSize}
                            darkMode={darkMode}
                          />

                          <SizeSelector
                            label="Paper Size"
                            sizes={paperSizes}
                            selectedSize={selectedPaperSize}
                            onSizeSelect={setSelectedPaperSize}
                            onCustomSizeAdd={addCustomPaperSize}
                            onCustomSizeDelete={deleteCustomPaperSize}
                            darkMode={darkMode}
                          />

                          <LayoutCustomizer
                            options={layoutOptions}
                            onChange={setLayoutOptions}
                            darkMode={darkMode}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Preview and Settings */}
          {selectedImageId && (
            <div className="animate-slide-up">
              <LayoutPreview
                images={images}
                layout={layout}
                selectedPhotoSize={selectedPhotoSize}
                selectedPaperSize={selectedPaperSize}
                previewBackground={previewBackground}
                onBackgroundChange={setPreviewBackground}
                darkMode={darkMode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dark mode toggle */}
      <Tooltip text="Press Ctrl+D to toggle dark mode" position="left">
        <button
          onClick={toggleDarkMode}
          className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
            darkMode
              ? "bg-white text-black hover:bg-gray-200 active:bg-gray-300"
              : "bg-black text-white hover:bg-gray-800 active:bg-gray-700"
          } hover:scale-110 active:scale-95`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </Tooltip>
    </div>
  );
}

export default App;
