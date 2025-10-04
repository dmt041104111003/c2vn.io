"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useState } from "react";
import { Course } from "~/constants/admin";
import CourseModalText from "./CourseModalText";
import CourseModalTitle from "./CourseModalTitle";

interface CourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll?: (course: Course) => void;
}

export default function CourseModal({ course, isOpen, onClose, onEnroll }: CourseModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { 
    setMounted(true); 
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !course) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
              opacity: 0,
              scaleX: 0,
              filter: "blur(12px)",
              transformOrigin: "right",
          }}
          animate={{
              opacity: 1,
              scaleX: 1,
              filter: "blur(0px)",
              transformOrigin: "right",
          }}
          exit={{
              opacity: 0,
              scaleX: 0,
              filter: "blur(12px)",
              transformOrigin: "right",
          }}
          transition={{
              duration: 0.6,
              ease: [0.25, 1, 0.5, 1],
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto transparent-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px] shadow-2xl">
              <div className="p-8">
                <div className="space-y-6">
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    <img
                      src={course.image || "/images/common/loading.png"}
                      alt={course.title || course.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/common/loading.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  
                  <div>
                    <CourseModalTitle
                      title={course.name}
                      maxLength={50}
                    />
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {course.name}
                      </span>
                      <span>
                        Created: {new Date(course.createdAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    
                    {/* Course Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {course.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Location:</strong> {course.location}
                          </span>
                        </div>
                      )}
                      
                      {course.startDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong>Start Date:</strong> {new Date(course.startDate).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit", 
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {course.description && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Course Description
                      </h4>
                      <CourseModalText
                        text={course.description}
                        maxLength={200}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        if (onEnroll && course) {
                          onEnroll(course);
                        }
                        onClose();
                      }}
                      className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                      Enroll in Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            onClick={onClose}
            className="absolute button"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '4em',
              height: '4em',
              border: 'none',
              background: 'rgba(180, 83, 107, 0.11)',
              borderRadius: '5px',
              transition: 'background 0.5s',
              zIndex: 50
            }}
          >
            <span 
              className="X"
              style={{
                content: "",
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2em',
                height: '1.5px',
                backgroundColor: 'rgb(255, 255, 255)',
                transform: 'translateX(-50%) rotate(45deg)'
              }}
            ></span>
            <span 
              className="Y"
              style={{
                content: "",
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2em',
                height: '1.5px',
                backgroundColor: '#fff',
                transform: 'translateX(-50%) rotate(-45deg)'
              }}
            ></span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
