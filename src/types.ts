export type LayoutType = "grid";

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

export interface LayoutOptions {
  customPadding?: number;
  customPhotosPerRow?: number;
  customRows?: number;
}

export interface Layout {
  photosPerRow: number;
  rows: number;
  total: number;
  type: LayoutType;
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
  size?: PhotoSize;
  customSize?: {
    width: number;
    height: number;
  };
};
