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
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
