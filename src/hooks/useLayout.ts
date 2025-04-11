import { useState } from "react";
import { LayoutType, PhotoboothTemplate } from "../types";

export const useLayout = () => {
  const [layoutType, setLayoutType] = useState<LayoutType>("grid");
  const [photoboothTemplate, setPhotoboothTemplate] =
    useState<PhotoboothTemplate>("classic");

  return {
    layoutType,
    setLayoutType,
    photoboothTemplate,
    setPhotoboothTemplate,
  };
};
