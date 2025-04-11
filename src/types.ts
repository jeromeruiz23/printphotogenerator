export type LayoutType = "grid" | "photobooth";

export type PhotoboothTemplate = "classic" | "strips" | "collage";

export interface PhotoSize {
  width: number;
  height: number;
  label: string;
  isCustom?: boolean;
}

export interface PaperSize {
  width: number;
  height: number;
  label: string;
  isCustom?: boolean;
}

export interface Layout {
  photosPerRow: number;
  rows: number;
  total: number;
  type: LayoutType;
  template?: PhotoboothTemplate;
  padding: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImageData = {
  id: string;
  dataUrl: string;
  cropArea: CropArea | null;
  position: { x: number; y: number };
  zoom: number;
  aspectRatio?: number;
};
