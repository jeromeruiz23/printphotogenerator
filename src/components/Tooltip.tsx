import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  className = "",
  position = "top",
  delay = 150,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<number>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
    } else {
      const timeout = window.setTimeout(() => {
        setIsMounted(false);
      }, 200); // Match the CSS transition duration
      return () => window.clearTimeout(timeout);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        setIsVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const handleMouseEnter = () => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    window.clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  const arrowPosition = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2",
    right: "left-[-4px] top-1/2 -translate-y-1/2",
    bottom: "top-[-4px] left-1/2 -translate-x-1/2",
    left: "right-[-4px] top-1/2 -translate-y-1/2",
  };

  return (
    <div
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isMounted && (
        <div
          ref={tooltipRef}
          role="tooltip"
          aria-hidden={!isVisible}
          className={`absolute z-50 px-2 py-1.5 text-xs font-medium rounded-md whitespace-nowrap
            bg-gray-900 text-white shadow-lg backdrop-blur-sm
            transition-all duration-200 select-none
            ${positionClasses[position]}
            ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          `}
        >
          {text}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 transition-transform duration-200
              ${arrowPosition[position]}
              ${isVisible ? "opacity-100" : "opacity-0"}
            `}
          />
        </div>
      )}
    </div>
  );
};
