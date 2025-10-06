"use client";

import { useEffect } from 'react';

export function TooltipHandler() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-tooltip] {
        position: relative;
        cursor: pointer;
      }
      
      [data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        margin-left: 8px;
        padding: 8px 12px;
        background-color: rgb(17 24 39);
        color: white;
        font-size: 14px;
        border-radius: 8px;
        white-space: nowrap;
        max-width: calc(100vw - 20px);
        white-space: normal;
        word-wrap: break-word;
        z-index: 1000;
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.2s;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      }
      
      [data-tooltip]:hover::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        margin-left: 2px;
        border: 4px solid transparent;
        border-right-color: rgb(17 24 39);
        z-index: 1000;
        pointer-events: none;
      }
      
      .dark [data-tooltip]:hover::after {
        background-color: rgb(243 244 246);
        color: rgb(17 24 39);
      }
      
      .dark [data-tooltip]:hover::before {
        border-right-color: rgb(243 244 246);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
} 