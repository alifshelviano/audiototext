'use client';

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
// import { Card, CardFooter, Image, Button } from "@heroui/card";

// Define the type for team members
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  expertise: string[];
}

const Team: React.FC = () => {
  // if (typeof window === "undefined") return null;

  const teamMembers: TeamMember[] = [
    {
      name: "Filbert Leonardo",
      role: "Project Manager",
      bio: "Leads project execution with precision and ensures backend systems are smooth and reliable.",
      avatar: "/photos/filbert.png",
      expertise: ["Leadership", "Node.js", "Project Planning"],
    },
    {
      name: "Bagas Dwiprasandi",
      role: "Frontend Engineer",
      bio: "Crafts beautiful and functional user experiences, combining design and clean frontend development.",
      avatar: "/photos/bagas.png",
      expertise: ["NextJS", "ReactJS", "TailwindCSS"],
    },
    {
      name: "Muhammad Alif Shlviano",
      role: "Backend Engineer",
      bio: "Focuses on building scalable backend systems and managing cloud infrastructure with best practices.",
      avatar: "/photos/alif.png",
      expertise: ["Express.js", "MongoDB", "AWS"],
    },
    {
      name: "Gladys Aisha Rizkita",
      role: "UI/UX Designer",
      bio: "Bridges design and development, ensuring every product decision supports both user needs and business goals.",
      avatar: "/photos/gladys.png",
      expertise: ["React", "Product Strategy", "UX Research"],
    },
    {
      name: "Muhammad Farhan",
      role: "Marketing Specialist",
      bio: "Drives growth through creative campaigns and data-driven strategies that connect users to our vision.",
      avatar: "/photos/farhan.png",
      expertise: ["Digital Marketing", "Content Strategy", "SEO"],
    },
    {
      name: "Riyan Wahyu Prasetyo",
      role: "Graphic Designer",
      bio: "Transforms ideas into stunning visuals that represent the heart of our brand and product identity.",
      avatar: "/photos/riyan.png",
      expertise: ["Branding", "Illustration", "Canva"],
    },
  ];

  return (
    <section id="team" className="py-20 bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Passionate experts dedicated to transforming how teams communicate</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="bg-gradient-to-br from-[#f8fafc]/90 to-[#eef2ff]/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-md hover:scale-[1.02] transition transform hover:-translate-y-2 duration-300 group"
            >
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-200 shadow-md group-hover:border-indigo-500 transition-all">
                  <Image src={member.avatar} alt={member.name} fill sizes="160px" className="object-cover" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-700 transition">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>

                <div className="flex flex-wrap justify-center gap-2">
                  {member.expertise.map((skill, skillIndex) => (
                    <span key={skillIndex} className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full text-xs text-gray-800 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
