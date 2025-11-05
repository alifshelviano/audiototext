"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function About() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What does LISN do?",
      a: "LISN helps teams automatically record, transcribe, and summarize meeting results so everyone can focus on the discussion without worrying about missing important points.",
    },
    {
      q: "How does LISN work during a meeting?",
      a: "Each user can create or join a room using a link or QR code. Recordings are merged automatically, converted to text, and summarized by AI to generate key points and tasks.",
    },
    {
      q: "Who are the primary target users of LISN?",
      a: "LISN's target users include students, remote workers, freelancers, or small teams who often conduct discussions and meetings, simplifying transcripts and summaries automatically.",
    },
  ];

  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-b from-cyan-50 via-cyan-100 to-blue-100 relative overflow-hidden"
    >
      {/* Glowing Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200/40 via-transparent to-blue-300/30 blur-3xl opacity-40 pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Image
              src="/assets/ilustrasi-1.png"
              alt="LISN Illustration"
              width={400}
              height={400}
              quality={100}
              className="w-full max-w-md lg:max-w-lg drop-shadow-2xl rounded-3xl"
            />
          </motion.div>

          {/* RIGHT - Text & FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Read more about <span className="text-cyan-600">LISN</span>
            </h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              LISN (Listen, Interpret, Summarize, Narrate) is an AI-powered meeting assistant that
              transforms spoken conversations into structured, actionable insights. It records and
              transcribes meetings in real time, summarizes key points, and generates follow-up
              action items to help teams save time, stay aligned, and never miss important details
              again.
            </p>

            {/* FAQ Accordion with Smooth Animation */}
            <div className="space-y-4">
              {faqs.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div
                    className={`
                      bg-white/80 backdrop-blur-md rounded-xl border border-white/50
                      shadow-md hover:shadow-xl transition-all duration-300
                      overflow-hidden cursor-pointer
                      ${openIndex === i ? "ring-2 ring-cyan-400" : ""}
                    `}
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    {/* Summary */}
                    <div className="p-5 flex justify-between items-center">
                      <h3 className="font-semibold text-cyan-500 text-lg pr-4">{item.q}</h3>
                      <motion.span
                        animate={{ rotate: openIndex === i ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-cyan-500 text-2xl flex-shrink-0"
                      >
                        +
                      </motion.span>
                    </div>

                    {/* Answer - Animated Height & Fade */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: openIndex === i ? "auto" : 0,
                        opacity: openIndex === i ? 1 : 0,
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{
                            y: openIndex === i ? 0 : -10,
                            opacity: openIndex === i ? 1 : 0,
                          }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="text-gray-600 text-sm leading-relaxed"
                        >
                          {item.a}
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
