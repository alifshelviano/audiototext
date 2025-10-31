"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  return (
    <>
      <section id="about" className="py-20 bg-gradient-to-b from-cyan-50 via-cyan-100 to-blue-100 relative overflow-hidden">
        {/* Optional glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200/40 via-transparent to-blue-300/30 blur-3xl opacity-40 pointer-events-none" />

        <div className="container relative z-10 mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* LEFT - Illustration Image */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="flex justify-center">
              <Image src="/assets/ilustrasi-1.png" alt="LISN Illustration" width={500} height={500} className="w-full max-w-md lg:max-w-lg drop-shadow-xl rounded-3xl" />
            </motion.div>

            {/* RIGHT - Text */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Read more about <span className="text-cyan-700">LISN</span>
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                LISN (Listen, Interpret, Summarize, Narrate) is an AI-powered meeting assistant that transforms spoken conversations into structured, actionable insights. It records and transcribes meetings in real time, summarizes key
                points, and generates follow-up action items to help teams save time, stay aligned, and never miss important details again.
              </p>

              <div className="space-y-4">
                {[
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
                ].map((item, i) => (
                  <details key={i} className="group bg-white/80 backdrop-blur-md shadow-md border border-white/50 rounded-xl p-5 cursor-pointer transition-all">
                    <summary className="font-semibold text-gray-800 flex justify-between items-center">
                      {item.q}
                      <span className="text-cyan-500 text-2xl leading-none group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>

    // <section id="about" className="py-20 bg-gradient-to-b from-white via-blue-50 to-white">
    //   <div className="container mx-auto px-6 lg:px-12">
    //     <div className="grid md:grid-cols-2 gap-12 items-center">
    //       {/* LEFT - Illustration Image */}
    //       <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="flex justify-center">
    //         <Image src="/assets/ilustrasi-1.png" alt="LISN Illustration" width={500} height={500} className="w-full max-w-md lg:max-w-lg drop-shadow-xl rounded-3xl" />
    //       </motion.div>

    //       {/* RIGHT - Text */}
    //       <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
    //         <h2 className="text-4xl font-bold text-gray-800 mb-4">
    //           Read more about <span className="text-indigo-600">LISN</span>
    //         </h2>
    //         <p className="text-gray-600 mb-6 leading-relaxed">
    //           LISN (Listen, Interpret, Summarize, Narrate) is an AI-powered meeting assistant that transforms spoken conversations into structured, actionable insights. It records and transcribes meetings in real time, summarizes key
    //           points, and generates follow-up action items to help individuals and teams save time, stay aligned, and never miss important details again.
    //         </p>

    //         <div className="space-y-4">
    //           {[
    //             {
    //               q: "What does LISN do?",
    //               a: "LISN helps teams automatically record, transcribe, and summarize meeting results so everyone can focus on the discussion without worrying about missing important points.",
    //             },
    //             {
    //               q: "How does LISN work during a meeting?",
    //               a: "Each user can create or join a room using a link or QR code. Recordings are merged automatically, converted to text, and summarized by AI to generate key points and tasks.",
    //             },
    //             {
    //               q: "Who are the primary target users of LISN?",
    //               a: "LISN's target users include students, remote workers, freelancers, or small teams who often conduct discussions and meetings — simplifying transcripts and summaries automatically.",
    //             },
    //           ].map((item, i) => (
    //             <details key={i} className="group bg-white shadow-md border border-gray-100 rounded-xl p-5 cursor-pointer transition-all">
    //               <summary className="font-semibold text-gray-800 flex justify-between items-center">
    //                 {item.q}
    //                 <span className="text-indigo-500 text-2xl leading-none group-open:rotate-45 transition-transform">+</span>
    //               </summary>
    //               <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.a}</p>
    //             </details>
    //           ))}
    //         </div>
    //       </motion.div>
    //     </div>
    //   </div>
    // </section>
  );
}
