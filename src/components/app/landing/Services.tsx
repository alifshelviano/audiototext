"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ServiceItem {
  title: string;
  description: string;
  image: string;
  link: string;
}

const Services: React.FC = () => {
  const services: ServiceItem[] = [
    {
      title: "Meeting Summarization",
      description: "LISN automatically listens to your discussions and generates accurate meeting summaries, saving your team valuable time. It identifies decisions, tasks, and key topics using advanced AI algorithms.",
      image: "/assets/services1.png",
      link: "#",
    },
    {
      title: "Insight Analytics",
      description: "Gain deeper understanding of your meetings through data-driven analytics. LISN helps you see patterns in communication, participation, and task completion to boost productivity.",
      image: "/assets/services2.png",
      link: "#",
    },
  ];

  return (
    <section id="services" className="py-20 bg-white/70 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Empowering your meetings with AI-powered tools for smarter collaboration and better decision making.</p>
        </div>

        <div className="space-y-24">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              {/* IMAGE */}
              <div className={`${index % 2 === 1 ? "md:order-2" : "md:order-1"} flex justify-center`}>
                <Image src={service.image} alt={service.title} width={400} height={400} quality={100} className="rounded-3xl shadow-lg w-full max-w-md object-cover hover:scale-105 transition-transform duration-500" />
              </div>

              {/* TEXT */}
              <div className={`${index % 2 === 1 ? "md:order-1 text-left md:text-right" : "md:order-2 text-left"}`}>
                <h3 className="text-2xl font-bold text-indigo-700 mb-4">{service.title}</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">{service.description}</p>
                <a href={service.link} className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition">
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}\
        </div>
      </div>
    </section>
  );
};

export default Services;