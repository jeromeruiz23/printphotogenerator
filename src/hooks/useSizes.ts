import { useState, useCallback } from "react";
import { PhotoSize, PaperSize } from "../types";
import { defaultPaperSizes, defaultPhotoSizes } from "../constants/common";

export const useSizes = () => {
  const [photoSizes, setPhotoSizes] = useState<PhotoSize[]>(defaultPhotoSizes);
  const [paperSizes, setPaperSizes] = useState<PaperSize[]>(defaultPaperSizes);
  const [selectedPhotoSize, setSelectedPhotoSize] = useState<PhotoSize>(
    photoSizes[0]
  );
  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>(
    paperSizes[0]
  );

  const addCustomPhotoSize = useCallback((width: number, height: number) => {
    if (width > 0 && height > 0) {
      const newSize: PhotoSize = {
        width,
        height,
        label: `Custom ${width}×${height}`,
        isCustom: true,
      };
      setPhotoSizes((prev) => [...prev, newSize]);
      setSelectedPhotoSize(newSize);
      return true;
    }
    return false;
  }, []);

  const addCustomPaperSize = useCallback((width: number, height: number) => {
    if (width > 0 && height > 0) {
      const newSize: PaperSize = {
        width,
        height,
        label: `Custom ${width}×${height}`,
        isCustom: true,
      };
      setPaperSizes((prev) => [...prev, newSize]);
      setSelectedPaperSize(newSize);
      return true;
    }
    return false;
  }, []);

  const deleteCustomPhotoSize = useCallback(
    (size: PhotoSize) => {
      if (size.isCustom) {
        setPhotoSizes((prev) => prev.filter((s) => s.label !== size.label));
        if (selectedPhotoSize.label === size.label) {
          setSelectedPhotoSize(photoSizes[0]);
        }
      }
    },
    [photoSizes, selectedPhotoSize.label]
  );

  const deleteCustomPaperSize = useCallback(
    (size: PaperSize) => {
      if (size.isCustom) {
        setPaperSizes((prev) => prev.filter((s) => s.label !== size.label));
        if (selectedPaperSize.label === size.label) {
          setSelectedPaperSize(paperSizes[0]);
        }
      }
    },
    [paperSizes, selectedPaperSize.label]
  );

  return {
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
  };
};
