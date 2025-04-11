export type PhotoSize = {
  width: number;
  height: number;
  label: string;
  isCustom?: boolean;
};

export type PaperSize = {
  width: number;
  height: number;
  label: string;
  isCustom?: boolean;
};

export type LayoutType = "grid" | "photobooth";
export type PhotoboothTemplate = "classic" | "strips" | "collage";

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Layout = {
  photosPerRow: number;
  rows: number;
  total: number;
  type: LayoutType;
  padding: number;
  template?: PhotoboothTemplate;
};

export type ImageData = {
  id: string;
  dataUrl: string;
  cropArea: CropArea | null;
  position: { x: number; y: number };
  zoom: number;
  aspectRatio?: number;
};
