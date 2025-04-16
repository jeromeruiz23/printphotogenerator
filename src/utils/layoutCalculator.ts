import { Layout, PhotoSize, PaperSize, LayoutOptions } from "../types";

export const calculateLayout = (
  selectedPhotoSize: PhotoSize,
  selectedPaperSize: PaperSize,
  options?: LayoutOptions
): Layout => {
  const defaultPadding = 2;
  const paperMargin = 10;

  const printableWidth = selectedPaperSize.width - 2 * paperMargin;
  const printableHeight = selectedPaperSize.height - 2 * paperMargin;

  const padding = options?.customPadding ?? defaultPadding;
  const photosPerRow =
    options?.customPhotosPerRow ??
    Math.floor(
      (printableWidth + padding) / (selectedPhotoSize.width + padding)
    );
  const rows =
    options?.customRows ??
    Math.floor(
      (printableHeight + padding) / (selectedPhotoSize.height + padding)
    );

  return {
    photosPerRow,
    rows,
    total: photosPerRow * rows,
    type: "grid",
    padding: padding,
  };
};
