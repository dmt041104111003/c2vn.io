"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { XIcon, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import EventImageModal from "./EventImageModal";
import { Event, EventCardProps } from "~/constants/events";

export default function EventCard({ event, index, editMode, onEditClick, onUpload, className }: EventCardProps) {
  const [maxChars, setMaxChars] = useState(30);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const updateMaxChars = () => {
      const width = window.innerWidth;
      if (width < 640) setMaxChars(25);
      else if (width < 1024) setMaxChars(30);
      else setMaxChars(30);
    };

    updateMaxChars();
    window.addEventListener("resize", updateMaxChars);
    return () => window.removeEventListener("resize", updateMaxChars);
  }, []);

  const handleImageClick = () => {
    if (!editMode && event.imageUrl) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: editMode ? 1 : 1.02 }}
        whileTap={{ scale: editMode ? 1 : 0.98 }}
        className={`relative rounded-xl overflow-hidden shadow-lg group cursor-pointer ${className}`}
      >
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {event.imageUrl ? (
          <>
            <Image
              src={event.imageUrl}
              alt={event.title}
              className={`object-cover w-full h-full transition-all ${editMode ? "opacity-80" : ""}`}
              fill
              quality={90}
              sizes="100vw"
              onClick={handleImageClick}
            />
            {editMode && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.(index);
                }}
                className="absolute top-0 right-0 p-1.5 rounded-full cursor-pointer bg-transparent"
              >
                <XIcon className="h-6 w-6 text-red-700 dark:text-red-400" />
              </div>
            )}
            {!editMode && (
              <div className="absolute bottom-4 left-4  text-white z-10">
                <h4 className="text-lg font-semibold truncate text-white drop-shadow-md">
                  {event.title.length > maxChars ? event.title.slice(0, maxChars) + "..." : event.title}
                </h4>

                <p className="text-sm opacity-80">{event.location}</p>
              </div>
            )}
          </>
        ) : editMode ? (
          <div
            className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg transition cursor-pointer border-blue-300 bg-white dark:bg-gray-800"
            onClick={() => onEditClick?.(index)}
          >
            <UploadCloud className="h-12 w-12 text-blue-500 dark:text-blue-400 mb-2" />
            <p className="text-sm font-medium text-blue-500 dark:text-blue-400">Click to add event</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <img
              src="/images/common/loading.png"
              alt="Loading placeholder"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </motion.div>

    <EventImageModal
      event={event}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
    />
    </>
  );
}
