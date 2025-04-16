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

  // Calculate total photos per page
  const photosPerPage = layout.photosPerRow * layout.rows;
  // Calculate total pages needed
  const totalPages = Math.ceil(images.length / photosPerPage);

  const getImage = (imageIndex: number) => {
    const availableImages = images.length;

    // If we have enough images, use them in sequence
    if (imageIndex < availableImages) {
      return images[imageIndex];
    }

    // If we need to repeat, use a different sequence to avoid adjacent duplicates
    const offset = Math.floor(imageIndex / availableImages) % availableImages;
    return images[(imageIndex + offset) % availableImages];
  };

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage([selectedPaperSize.width, selectedPaperSize.height]);
    }

    // Set background color for the current page
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

    // Process photos for the current page
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.photosPerRow; col++) {
        const imageIndex =
          page * photosPerPage + row * layout.photosPerRow + col;

        const currentImage = getImage(imageIndex);
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
          cropArea.x -
            (currentImage.position.x * cropArea.width) / canvas.width,
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

  doc.save("photo-layout.pdf");
};
