import React, { useState } from "react";
import { X } from "lucide-react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { ImageData } from "../types";

interface ImageSelectorProps {
  images: ImageData[];
  selectedImageId: string | null;
  onImageSelect: (id: string) => void;
  onImageRemove: (id: string) => void;
  onImagesReorder: (newImages: ImageData[]) => void;
  darkMode: boolean;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  images,
  selectedImageId,
  onImageSelect,
  onImageRemove,
  onImagesReorder,
  darkMode,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const imagesPerPage = 6;
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const currentImages = images.slice(
    currentPage * imagesPerPage,
    (currentPage + 1) * imagesPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newImages = Array.from(images);
    const [reorderedItem] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, reorderedItem);

    onImagesReorder(newImages);
  };

  return (
    <div className="relative flex items-center justify-center mb-6">
      {images.length > imagesPerPage && (
        <button
          onClick={handlePrevPage}
          className={`absolute -left-2 p-3 rounded-full transform transition-all duration-200 ${
            darkMode
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-white hover:bg-gray-100 text-black"
          } shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
            currentPage === 0 ? "invisible" : ""
          } hover:scale-110 active:scale-95`}
          disabled={currentPage === 0}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="imageList" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex gap-3 justify-center items-center mx-20 py-4 px-6 rounded-xl transition-all duration-200 ${
                snapshot.isDraggingOver
                  ? darkMode
                    ? "bg-gray-800/80 shadow-lg"
                    : "bg-gray-100/80 shadow-lg"
                  : ""
              }`}
            >
              {currentImages.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative group transition-all duration-200 ${
                        snapshot.isDragging ? "scale-105 rotate-2" : ""
                      }`}
                    >
                      <div className={`relative rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                        selectedImageId === image.id
                          ? darkMode
                            ? "ring-2 ring-white shadow-xl shadow-white/10"
                            : "ring-2 ring-black shadow-xl"
                          : snapshot.isDragging
                          ? "shadow-xl"
                          : "hover:shadow-lg"
                      }`}>
                        <img
                          src={image.dataUrl}
                          alt={`Image ${index + 1}`}
                          className={`w-24 h-24 object-cover transition-transform duration-200
                            ${snapshot.isDragging ? "opacity-90" : "group-hover:scale-105"}
                            cursor-move`}
                          onClick={() => onImageSelect(image.id)}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onImageRemove(image.id);
                          }}
                          className={`absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full 
                            ${
                              darkMode
                                ? "bg-gray-800 hover:bg-gray-700"
                                : "bg-white hover:bg-gray-100"
                            }
                            shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-2 -translate-y-2
                            group-hover:translate-x-0 group-hover:translate-y-0
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
                          aria-label="Remove image"
                        >
                          <X className={`w-3 h-3 ${darkMode ? "text-white" : "text-black"}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {images.length > imagesPerPage && (
        <button
          onClick={handleNextPage}
          className={`absolute -right-2 p-3 rounded-full transform transition-all duration-200 ${
            darkMode
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-white hover:bg-gray-100 text-black"
          } shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
            currentPage >= Math.ceil(images.length / imagesPerPage) - 1 ? "invisible" : ""
          } hover:scale-110 active:scale-95`}
          disabled={currentPage >= Math.ceil(images.length / imagesPerPage) - 1}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
