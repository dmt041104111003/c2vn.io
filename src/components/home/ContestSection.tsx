"use client";

import React from "react";
import ContestForm from "~/components/home/ContestForm";
import ContestTable from "~/components/home/ContestTable";

export default function ContestSection() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
        <div className="md:order-1 order-2 w-full">
          <ContestForm />
        </div>
        <div className="md:order-2 order-1 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
            <div className="p-4 sm:p-5 w-full">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">Bảng xếp hạng top 20</h3>
              <ContestTable />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


