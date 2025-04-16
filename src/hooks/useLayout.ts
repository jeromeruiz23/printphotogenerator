import { useState } from "react";
import { LayoutType } from "../types";

export const useLayout = () => {
  const [layoutType] = useState<LayoutType>("grid");

  return {
    layoutType,
  };
};
