"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Title from "~/components/title";

const cards = [
  {
    href: "/about",
    title: "Our Team",
    description:
      "Meet the people driving Cardano2vn's vision, from product developers to blockchain experts and community builders.",
    cta: "Meet the Team",
  },
  {
    href: "/project",
    title: "Our Technology",
    description:
      "Discover how we leverage blockchain and innovative tools to build trust, governance, and contribution management.",
    cta: "Learn More",
  },
  {
    href: "/our-service",
    title: "Our Service",
    description:
      "Support the ecosystem via our SPO and DRep initiatives and explore services we provide to the community.",
    cta: "Explore",
  },
];

export default function ServiceHubClient() {
  return (
    <main className="relative pt-20 bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.12, scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed left-[-200px] top-1/2 -translate-y-1/2 z-0 pointer-events-none select-none"
      >
        <img
          src="/images/common/loading.png"
          alt="Background Logo"
          className="w-[1200px] h-[1200px] object-contain"
          draggable={false}
          style={{ objectPosition: "left center" }}
        />
      </motion.div>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Title
            title="Cardano2vn Service"
            description="Jump to About, Projects, and Our Service — discover who we are, what we build, and how we support the ecosystem."
          />
        </motion.div>

        <div className="mx-auto mb-16">
          <div className="rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 p-8 backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Our Cardano Team</h3>
            <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              We are a passionate team of Cardano enthusiasts, developers, and community builders dedicated to advancing the Cardano ecosystem in
              Vietnam. Our mission is to bridge the gap between traditional technology and blockchain innovation, making Cardano accessible to
              everyone.
            </p>
            <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              With expertise spanning from smart contract development and DeFi protocols to community education and governance participation, we work
              together to create sustainable solutions that benefit the entire Cardano community. Our diverse backgrounds in education, blockchain
              development, product management, and community building enable us to approach challenges from multiple perspectives.
            </p>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Join us in building the future of decentralized finance and governance on Cardano. Together, we're creating the infrastructure for
              trust-based distributed work and fostering a vibrant, inclusive Cardano ecosystem in Vietnam.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 p-6 sm:p-8 backdrop-blur-sm"
            >
              <Link href={card.href} className="flex h-full flex-col">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 flex-1 leading-relaxed">{card.description}</p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group">
                  {card.cta}
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}


