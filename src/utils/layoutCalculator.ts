import {
  Layout,
  LayoutType,
  PhotoSize,
  PaperSize,
  PhotoboothTemplate,
} from "../types";

export const calculateLayout = (
  layoutType: LayoutType,
  selectedPhotoSize: PhotoSize,
  selectedPaperSize: PaperSize,
  photoboothTemplate?: PhotoboothTemplate
): Layout => {
  const defaultPadding = 2;
  const photoboothPadding = 10;
  const paperMargin = 10;

  const printableWidth = selectedPaperSize.width - 2 * paperMargin;
  const printableHeight = selectedPaperSize.height - 2 * paperMargin;

  if (layoutType === "photobooth") {
    const padding = photoboothPadding;
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
      default:
        return {
          photosPerRow: 2,
          rows: 2,
          total: 4,
          type: "photobooth",
          template: "classic",
          padding: padding,
        };
    }
  }

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
