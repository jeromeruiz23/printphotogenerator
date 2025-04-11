import { useState, useCallback } from "react";
import { ImageData } from "../types";

export const useImages = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const addImages = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const imageAspectRatio = img.width / img.height;
            const newImage: ImageData = {
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

  const removeImage = useCallback(
    (imageId: string) => {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      if (selectedImageId === imageId) {
        setSelectedImageId(() => {
          const remainingImages = images.filter((img) => img.id !== imageId);
          return remainingImages.length > 0 ? remainingImages[0].id : null;
        });
      }
    },
    [images, selectedImageId]
  );

  const updateImagePosition = useCallback(
    (imageId: string, position: { x: number; y: number }) => {
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, position } : img))
      );
    },
    []
  );

  const updateImageZoom = useCallback((imageId: string, zoom: number) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, zoom } : img))
    );
  }, []);

  const updateCropArea = useCallback(
    (imageId: string, cropArea: ImageData["cropArea"]) => {
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, cropArea } : img))
      );
    },
    []
  );

  const reorderImages = useCallback((newImages: ImageData[]) => {
    setImages(newImages);
  }, []);

  return {
    images,
    selectedImageId,
    setSelectedImageId,
    addImages,
    removeImage,
    updateImagePosition,
    updateImageZoom,
    updateCropArea,
    reorderImages,
  };
};
