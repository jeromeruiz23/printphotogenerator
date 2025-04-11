import { jsPDF } from "jspdf";
import { Layout, PhotoSize, PaperSize, ImageData } from "../types";

export const generatePDF = async (
  images: ImageData[],
  layout: Layout,
  selectedPhotoSize: PhotoSize,
  selectedPaperSize: PaperSize,
  previewBackground: "white" | "black"
) => {
  if (images.length === 0) return;

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
  const marginY = paperMargin + (printableHeight - totalHeightWithPadding) / 2;

  // Helper function to get the correct image for photobooth layouts
  const getPhotoboothImage = (row: number, col: number) => {
    const imageIndex = row * layout.photosPerRow + col;
    if (layout.type !== "photobooth") return images[imageIndex % images.length];

    switch (layout.template) {
      case "classic":
        // Use first 4 images, or repeat the first one if fewer images
        return images[Math.min(imageIndex, images.length - 1)];
      case "strips":
        // Use first 4 images vertically, or repeat the first one
        return images[Math.min(imageIndex, images.length - 1)];
      case "collage":
        // Use first 6 images, or repeat in sequence if fewer images
        return images[imageIndex % images.length];
      default:
        return images[0];
    }
  };

  // Process photos for the page
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.photosPerRow; col++) {
      const currentImage = getPhotoboothImage(row, col);
      if (!currentImage) continue;

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

      // Apply zoom and position adjustments
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(currentImage.zoom, currentImage.zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw and crop image
      ctx.drawImage(
        img,
        cropArea.x - (currentImage.position.x * cropArea.width) / canvas.width,
        cropArea.y -
          (currentImage.position.y * cropArea.height) / canvas.height,
        cropArea.width,
        cropArea.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      ctx.restore();

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
