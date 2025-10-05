"use client";

import { useState } from "react";
import Link from "next/link";
import { ProjectCardProps } from '~/constants/catalyst';
import { TipTapPreview } from "~/components/ui/tiptap-preview";

export default function ProjectCard({ project, onOpenModal }: ProjectCardProps & { onOpenModal: (project: any) => void }) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <>
      <div
        className="group w-full rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 shadow-xl backdrop-blur-sm transition-all hover:border-gray-300 dark:hover:border-white/40 hover:shadow-2xl cursor-pointer"
        onClick={() => onOpenModal(project)}
      >
        <div className="flex w-full">
          <div className="flex-grow border-l-4 bg-gray-50 dark:bg-gray-900/60 border-green-500 rounded-l-lg">
            <div className="p-5">
              <div className="mb-3">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {project.fund && `${project.fund}: `}{project.title}
                </h3>
              </div>
              <div className="max-w-2xl text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                <TipTapPreview content={project.description} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full min-w-[70px] justify-center ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  {project.href && (
                    <Link
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Proposal
                    </Link>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  Click to view details
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-32 flex-col justify-center bg-green-100 dark:bg-green-900/30 rounded-r-lg p-4">
            <div className="flex flex-col items-end">
              <div className="text-xl font-bold text-green-700 dark:text-green-300">{project.year}</div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">{project.quarterly}</div>
              <div className="mt-6 text-xs font-medium text-green-700 dark:text-green-300">{project.fund || 'No Fund'}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 