"use client";

import React from "react";
import { motion } from "framer-motion";

interface Plan {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

const Pricing: React.FC = () => {
  const plans: Plan[] = [
    {
      name: "Daily",
      price: "$0.05/day",
      features: [
        "60 transcription minutes",
        "Advance AI Summarizer",
        "Meeting Health Score and Sentiment Analysis",
      ],
    },
    {
      name: "Weekly",
      price: "$3/week",
      features: [
        "420 transcription minutes",
        "Advanced AI Summarizer",
        "Meeting Health Score and Sentiment Analysis",
      ],
      highlight: true,
    },
    {
      name: "Monthly",
      price: "$12/months",
      features: [
        "1800 transcription minutes",
        "Advance AI Summarizer",
        "Meeting Health Score and Sentiment Analysis",
      ],
    },
  ];

  return (
    <>
      <section
        id="pricing"
        className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden"
      >
        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[120px] top-20 left-[-150px] animate-pulse"></div>
          <div className="absolute w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[100px] bottom-10 right-[-120px] animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            Flexible Pricing for Everyone
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-600 max-w-2xl mx-auto mb-16"
          >
            No matter your team size start free, grow big, and experience LISN’s full potential.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-10">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`
                relative rounded-3xl p-8 shadow-xl border border-white/20
                bg-white/20 backdrop-blur-2xl
                transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03]
                hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]
                ${plan.highlight ? "ring-2 ring-indigo-400 bg-gradient-to-br from-white/30 to-indigo-50/30" : ""}
              `}
              >
                {/* NEON BORDER EFFECT */}
                <div
                  className={`absolute inset-0 rounded-3xl border-2 opacity-30 transition-all duration-300
                ${plan.highlight ? "border-indigo-400" : "border-blue-200 hover:border-indigo-300"}`}
                ></div>

                <h3 className="text-2xl font-bold text-indigo-700 mb-4 relative z-10">
                  {plan.name}
                </h3>
                <p className="text-3xl font-extrabold text-gray-800 mb-6 relative z-10">
                  {plan.price}
                </p>

                <ul className="space-y-3 text-gray-700 mb-8 relative z-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center justify-center gap-2">
                      <span className="text-cyan-500 font-bold">✓</span> {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-full font-semibold transition-all relative z-10
                  ${plan.highlight ? "bg-cyan-600 text-white shadow-lg hover:bg-indigo-700" : "bg-white/70 text-indigo-700 hover:bg-indigo-100"}`}
                >
                  {plan.highlight ? "Get Started" : "Learn More"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
