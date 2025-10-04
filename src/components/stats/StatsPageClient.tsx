'use client';

import React from 'react';
import { motion } from "framer-motion";
import Title from "~/components/title";
import ServiceContent from '~/components/our-service/ServiceContent';
import { useNotifications } from "~/hooks/useNotifications";
// import WaveFooterSection from "~/components/home/WaveFooterSection";

function StatsPageContent() {
  useNotifications();
  
  return (
    <main className="relative pt-20 bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Title
            title="Our Service"
            description="Discover our SPO (Stake Pool Operator) and DREP (Delegated Representative) services. Learn how to support our Cardano community initiatives."
          />
        </motion.div>
   
        <ServiceContent />
  
      </div>
      {/* <WaveFooterSection /> */}
    </main>
  );
}

export default function StatsPageClient() {
  return <StatsPageContent />;
}
