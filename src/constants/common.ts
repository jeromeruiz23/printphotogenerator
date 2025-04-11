import { PhotoSize, PaperSize } from "../types";

export const defaultPhotoSizes: PhotoSize[] = [
  { width: 50.8, height: 50.8, label: "2x2 inch" },
  { width: 35, height: 45, label: "Passport (35x45mm)" },
  { width: 89, height: 127, label: "3.5x5 inch" },
  { width: 102, height: 152, label: "4x6 inch" },
  { width: 127, height: 178, label: "5x7 inch" },
  { width: 203, height: 254, label: "8x10 inch" },
  { width: 254, height: 305, label: "10x12 inch" },
  { width: 25, height: 35, label: "ID Photo (25x35mm)" },
  { width: 40, height: 60, label: "Visa (40x60mm)" },
];

export const defaultPaperSizes: PaperSize[] = [
  { width: 210, height: 297, label: "A4" },
  { width: 216, height: 279, label: "Letter" },
  { width: 182, height: 257, label: "B5" },
  { width: 148, height: 210, label: "A5" },
  { width: 297, height: 420, label: "A3" },
  { width: 257, height: 364, label: "B4" },
  { width: 105, height: 148, label: "A6" },
];
