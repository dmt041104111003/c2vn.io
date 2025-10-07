"use client";

import React from 'react';
import Link from "next/link";
import { motion } from "framer-motion";
import { routers } from "~/constants/routers";
import { TipTapPreview } from "~/components/ui/tiptap-preview";

interface LandingContentSectionProps {
  content: {
    title: string;
    subtitle: string;
    description: string;
    mainText: string;
  };
}

export default function LandingContentSection({ content }: LandingContentSectionProps) {
  const totalLength = content.title.length + content.subtitle.length + content.description.length + content.mainText.length;
  const getFontSizes = () => {
    if (totalLength > 500) {
      return {
        title: "text-3xl lg:text-5xl xl:text-6xl",
        subtitle: "text-2xl lg:text-4xl xl:text-5xl", 
        description: "text-base lg:text-lg xl:text-xl",
        mainText: "text-sm lg:text-base xl:text-lg",
      };
    } else if (totalLength > 300) {
      return {
        title: "text-4xl lg:text-6xl xl:text-7xl",
        subtitle: "text-3xl lg:text-5xl xl:text-6xl",
        description: "text-lg lg:text-xl xl:text-2xl", 
        mainText: "text-base lg:text-lg xl:text-xl",
      };
    } else {
      return {
        title: "text-5xl lg:text-7xl xl:text-8xl",
        subtitle: "text-4xl lg:text-6xl xl:text-7xl",
        description: "text-xl lg:text-2xl xl:text-3xl",
        mainText: "text-lg lg:text-xl xl:text-2xl", 
      };
    }
  };

  const fontSizes = getFontSizes();

  const scrollToContact = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
      const headerOffset = 100;
      const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // Fallback: navigate to hash on home
      window.location.assign('/#contact');
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center">
      <h1 className={`mb-4 lg:mb-6 font-bold ${fontSizes.title}`}>
        <span className="block tracking-tight text-gray-900 dark:text-white">{content.title}</span>
        <span className="block text-gray-900 dark:text-white tracking-tight">
          {content.subtitle}
        </span>
        <div className={`mt-2 lg:mt-3 block font-normal text-gray-600 dark:text-gray-300 ${fontSizes.description}`}>
          <TipTapPreview content={content.description} />
        </div>
        <div className={`leading-relaxed text-gray-600 dark:text-gray-300 relative border-l-2 border-gray-300 dark:border-white/20 pl-4 lg:pl-6 font-normal ${fontSizes.mainText}`}>
          <TipTapPreview content={content.mainText} />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-8">
          <Link
            href={routers.service}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success bg-blue-600 dark:bg-white px-6 lg:px-8 py-3 lg:py-4 font-semibold text-white dark:text-blue-900 shadow-xl hover:bg-blue-700 dark:hover:bg-gray-100 text-base lg:text-lg xl:text-xl"
          >
            About Us
          </Link>
          <button
            onClick={scrollToContact}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-white/50 px-6 lg:px-8 py-3 lg:py-4 font-semibold text-gray-900 dark:text-white shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm lg:text-base xl:text-lg"
            aria-label="Register our course"
          >
            Register our course
          </button>
        </div>
      </h1>
    
    </section>
  );
}
