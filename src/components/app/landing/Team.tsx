// INI YANG KEENAM
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
// import { loadFull } from "tsparticles";
import { loadSlim } from "tsparticles-slim";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  expertise: string[];
}

const Team: React.FC = () => {
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
    <section
      id="team"
      className="relative py-20 bg-[#f8ffff] flex flex-col items-center text-gray-900 overflow-hidden"
    >
      {/* Sparkling Background */}
      <Particles
        id="tsparticles"
        init={async (engine) => {
          await loadSlim(engine); // ✅ versi baru
        }}
        options={{
          background: { color: "#f8ffff" },
          fullScreen: { enable: false },
          particles: {
            number: { value: 40 },
            color: { value: ["#00ffff", "#00bfff", "#7fffd4"] },
            shape: { type: "circle" },
            opacity: { value: { min: 0.3, max: 0.8 } },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 0.6,
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "out" },
            },
          },
        }}
        className="absolute inset-0 z-0"
      />

      {/* <Particles
        id="tsparticles"
        init={async (engine) => {
          await loadFull(engine);
        }}
        options={{
          background: { color: "#f8ffff" },
          fullScreen: { enable: false },
          particles: {
            number: { value: 40 },
            color: { value: ["#00ffff", "#00bfff", "#7fffd4"] },
            shape: { type: "circle" },
            opacity: { value: { min: 0.3, max: 0.8 } },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 0.6,
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "out" },
            },
          },
        }}
        className="absolute inset-0 z-0"
      /> */}

      {/* Title */}
      <div className="relative z-10 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          Our <span className="text-cyan-600">Team Member</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Passionate experts dedicated to transforming how teams communicate
        </p>
      </div>

      {/* Members */}
      <div className="relative z-10 flex flex-wrap justify-center items-center gap-4 px-6 max-w-6xl">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative w-24 sm:w-28 md:w-32 lg:w-36 h-[200px] sm:h-[240px] md:h-[360px] overflow-hidden rounded-2xl group transition-all duration-500 hover:w-56 lg:hover:w-64 cursor-pointer shadow-lg hover:shadow-cyan-200/40"
          >
            {/* Image */}
            <Image
              src={member.avatar}
              alt={member.name}
              fill
              className="object-cover object-top transition-all duration-500 group-hover:scale-110"
            />

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">{member.name}</h3>
              <p className="text-xs sm:text-sm text-indigo-200 mb-2">{member.role}</p>
              <p className="text-[10px] sm:text-xs text-gray-300 mb-3 leading-snug">{member.bio}</p>

              <div className="flex flex-wrap gap-1">
                {member.expertise.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="text-[9px] sm:text-[10px] bg-white/20 border border-white/30 px-2 py-[2px] rounded-full text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Team;

// INI YANG KELIMA
// "use client";

// import React from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";

// interface TeamMember {
//   name: string;
//   role: string;
//   bio: string;
//   avatar: string;
//   expertise: string[];
// }

// const Team: React.FC = () => {
//   const teamMembers: TeamMember[] = [
//     {
//       name: "Filbert Leonardo",
//       role: "Project Manager",
//       bio: "Leads project execution with precision and ensures backend systems are smooth and reliable.",
//       avatar: "/photos/filbert.png",
//       expertise: ["Leadership", "Node.js", "Project Planning"],
//     },
//     {
//       name: "Bagas Dwiprasandi",
//       role: "Frontend Engineer",
//       bio: "Crafts beautiful and functional user experiences, combining design and clean frontend development.",
//       avatar: "/photos/bagas.png",
//       expertise: ["NextJS", "ReactJS", "TailwindCSS"],
//     },
//     {
//       name: "Muhammad Alif Shlviano",
//       role: "Backend Engineer",
//       bio: "Focuses on building scalable backend systems and managing cloud infrastructure with best practices.",
//       avatar: "/photos/alif.png",
//       expertise: ["Express.js", "MongoDB", "AWS"],
//     },
//     {
//       name: "Gladys Aisha Rizkita",
//       role: "UI/UX Designer",
//       bio: "Bridges design and development, ensuring every product decision supports both user needs and business goals.",
//       avatar: "/photos/gladys.png",
//       expertise: ["React", "Product Strategy", "UX Research"],
//     },
//     {
//       name: "Muhammad Farhan",
//       role: "Marketing Specialist",
//       bio: "Drives growth through creative campaigns and data-driven strategies that connect users to our vision.",
//       avatar: "/photos/farhan.png",
//       expertise: ["Digital Marketing", "Content Strategy", "SEO"],
//     },
//     {
//       name: "Riyan Wahyu Prasetyo",
//       role: "Graphic Designer",
//       bio: "Transforms ideas into stunning visuals that represent the heart of our brand and product identity.",
//       avatar: "/photos/riyan.png",
//       expertise: ["Branding", "Illustration", "Canva"],
//     },
//   ];

//   return (
//     <section id="team" className="py-20 bg-[#f8ffff] flex flex-col items-center text-gray-900">
//       <div className="mb-12">
//         <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
//           Our <span className="text-cyan-600">Team Member</span>
//         </h2>
//         {/* <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
//           Our Team Member
//         </h2> */}
//         <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
//           Passionate experts dedicated to transforming how teams communicate
//         </p>
//       </div>

//       {/* Wrapper */}
//       <div className="flex flex-wrap justify-center items-center gap-4 px-6 max-w-6xl">
//         {teamMembers.map((member, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: index * 0.1 }}
//             className="relative w-24 sm:w-28 md:w-32 lg:w-36 h-[200px] sm:h-[240px] md:h-[360px] overflow-hidden rounded-2xl group transition-all duration-500 hover:w-56 lg:hover:w-64 cursor-pointer"
//           >
//             {/* Image */}
//             <Image
//               src={member.avatar}
//               alt={member.name}
//               fill
//               className="object-cover object-top transition-all duration-500 group-hover:scale-110"
//             />

//             {/* Overlay Info */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
//               <h3 className="text-base sm:text-lg font-semibold text-white">{member.name}</h3>
//               <p className="text-xs sm:text-sm text-indigo-200 mb-2">{member.role}</p>
//               <p className="text-[10px] sm:text-xs text-gray-300 mb-3 leading-snug">{member.bio}</p>

//               <div className="flex flex-wrap gap-1">
//                 {member.expertise.map((skill, skillIndex) => (
//                   <span
//                     key={skillIndex}
//                     className="text-[9px] sm:text-[10px] bg-white/20 border border-white/30 px-2 py-[2px] rounded-full text-white"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Team;

// INI YANG KEEMPAT
// "use client";

// import React from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";

// interface TeamMember {
//   name: string;
//   role: string;
//   avatar: string;
// }

// const Team: React.FC = () => {
//   const teamMembers: TeamMember[] = [
//     {
//       name: "Filbert Leonardo",
//       role: "Project Manager",
//       avatar: "/photos/filbert.png",
//     },
//     {
//       name: "Bagas Dwiprasandi",
//       role: "Frontend Engineer",
//       avatar: "/photos/bagas.png",
//     },
//     {
//       name: "Muhammad Alif Shlviano",
//       role: "Backend Engineer",
//       avatar: "/photos/alif.png",
//     },
//     {
//       name: "Gladys Aisha Rizkita",
//       role: "UI/UX Designer",
//       avatar: "/photos/gladys.png",
//     },
//     {
//       name: "Muhammad Farhan",
//       role: "Marketing Specialist",
//       avatar: "/photos/farhan.png",
//     },
//     {
//       name: "Riyan Wahyu Prasetyo",
//       role: "Graphic Designer",
//       avatar: "/photos/riyan.png",
//     },
//   ];

//   return (
//     <section id="team" className="py-20 bg-[#c0fafa] text-white flex flex-col items-center">
//       <h2 className="text-3xl font-semibold mb-8 flex items-center gap-2">Our Team Member</h2>

//       {/* Wrapper scrollable */}
//       <div className="flex overflow-x-auto justify-center gap-4 p-4 w-full max-w-6xl">
//         {teamMembers.map((member, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 40 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: index * 0.1 }}
//             className="relative w-24 h-[400px] flex-shrink-0 overflow-hidden rounded-xl group transition-all duration-500 hover:w-64 cursor-pointer snap-center"
//           >
//             {/* Image */}
//             <Image
//               src={member.avatar}
//               alt={member.name}
//               fill
//               className="object-cover transition-all duration-500 group-hover:scale-110"
//             />

//             {/* Overlay info */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
//               <h3 className="text-lg font-semibold">{member.name}</h3>
//               <p className="text-sm text-gray-300">{member.role}</p>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Team;

// INI YANG KETIGA
// "use client";

// import React from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";

// interface TeamMember {
//   name: string;
//   role: string;
//   bio: string;
//   avatar: string;
//   expertise: string[];
// }

// const Team: React.FC = () => {
//   const teamMembers: TeamMember[] = [
//     {
//       name: "Filbert Leonardo",
//       role: "Project Manager",
//       avatar: "/photos/filbert.png",
//       bio: "Leads project execution with precision and ensures backend systems are smooth and reliable.",
//       expertise: ["Leadership", "Node.js", "Project Planning"],
//     },
//     {
//       name: "Bagas Dwiprasandi",
//       role: "Frontend Engineer",
//       avatar: "/photos/bagas.png",
//       bio: "Crafts beautiful and functional user experiences, combining design and clean frontend development.",
//       expertise: ["NextJS", "ReactJS", "TailwindCSS"],
//     },
//     {
//       name: "Muhammad Alif Shlviano",
//       role: "Backend Engineer",
//       avatar: "/photos/alif.png",
//       bio: "Focuses on building scalable backend systems and managing cloud infrastructure with best practices.",
//       expertise: ["Express.js", "MongoDB", "AWS"],
//     },
//     {
//       name: "Gladys Aisha Rizkita",
//       role: "UI/UX Designer",
//       avatar: "/photos/gladys.png",
//       bio: "Bridges design and development, ensuring every product decision supports both user needs and business goals.",
//       expertise: ["React", "Product Strategy", "UX Research"],
//     },
//     {
//       name: "Muhammad Farhan",
//       role: "Marketing Specialist",
//       avatar: "/photos/farhan.png",
//       bio: "Drives growth through creative campaigns and data-driven strategies that connect users to our vision.",
//       expertise: ["Digital Marketing", "Content Strategy", "SEO"],
//     },
//     {
//       name: "Riyan Wahyu Prasetyo",
//       role: "Graphic Designer",
//       avatar: "/photos/riyan.png",
//       bio: "Transforms ideas into stunning visuals that represent the heart of our brand and product identity.",
//       expertise: ["Branding", "Illustration", "Canva"],
//     },
//   ];

//   return (
//     <section id="team" className="py-24 bg-black overflow-hidden">
//       <div className="container mx-auto px-6">
//         {/* Title */}
//         <div className="text-center mb-16">
//           <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Meet Our Team</h2>
//           <p className="text-xl text-gray-400 max-w-2xl mx-auto">
//             Passionate experts dedicated to transforming how teams communicate
//           </p>
//         </div>

//         {/* Horizontal Scroll */}
//         <div className="overflow-x-auto scrollbar-hide pb-8">
//           <div className="flex gap-6 px-4 min-w-max">
//             {teamMembers.map((member, index) => (
//               <motion.div
//                 key={index}
//                 className="relative flex-shrink-0"
//                 initial={{ opacity: 0, y: 60 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.7, delay: index * 0.1 }}
//                 viewport={{ once: true }}
//               >
//                 {/* Card */}
//                 <motion.div
//                   className="group relative w-72 h-96 rounded-3xl overflow-hidden cursor-pointer"
//                   whileHover={{
//                     scale: 1.08,
//                     x: -100,
//                     zIndex: 20,
//                   }}
//                   transition={{ type: "spring", stiffness: 320, damping: 24 }}
//                 >
//                   {/* Image */}
//                   <div className="absolute inset-0">
//                     <Image
//                       src={member.avatar}
//                       alt={member.name}
//                       fill
//                       sizes="(max-width: 768px) 80vw, 300px"
//                       className="object-cover transition-all duration-700
//                                  grayscale brightness-75
//                                  group-hover:grayscale-0 group-hover:brightness-100
//                                  group-hover:scale-110"
//                       priority={index < 3}
//                     />
//                   </div>

//                   {/* Dark Overlay */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

//                   {/* Spotlight Glow */}
//                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
//                     <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent blur-3xl" />
//                   </div>

//                   {/* Content */}
//                   <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
//                     {/* Name & Role - Always Visible */}
//                     <div className="translate-y-0 transition-all duration-500">
//                       <h3 className="text-2xl font-bold mb-1 drop-shadow-2xl">{member.name}</h3>
//                       <p className="text-amber-400 font-medium text-sm tracking-wider drop-shadow-lg">
//                         {member.role}
//                       </p>
//                     </div>

//                     {/* Bio & Skills - Hover Only */}
//                     <div className="mt-6 space-y-4 opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-500 delay-100">
//                       <p className="text-sm text-gray-200 leading-relaxed line-clamp-3">
//                         {member.bio}
//                       </p>

//                       <div className="flex flex-wrap gap-2 pt-2">
//                         {member.expertise.map((skill, i) => (
//                           <span
//                             key={i}
//                             className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-gray-200"
//                           >
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>

//         {/* Scroll Dots */}
//         <div className="flex justify-center gap-2 mt-10">
//           {teamMembers.map((_, i) => (
//             <div
//               key={i}
//               className="w-1.5 h-1.5 rounded-full bg-gray-600 transition-all hover:bg-amber-400"
//             />
//           ))}
//         </div>
//       </div>

//       {/* Hide Scrollbar */}
//       <style jsx>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default Team;

// INI YANG KEDUA
// "use client";

// import React from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";

// interface TeamMember {
//   name: string;
//   role: string;
//   bio: string;
//   avatar: string;
//   expertise: string[];
// }

// const Team: React.FC = () => {
//   const teamMembers: TeamMember[] = [
//     {
//       name: "Filbert Leonardo",
//       role: "Project Manager",
//       bio: "Leads project execution with precision and ensures backend systems are smooth and reliable.",
//       avatar: "/photos/filbert.png",
//       expertise: ["Leadership", "Node.js", "Project Planning"],
//     },
//     {
//       name: "Bagas Dwiprasandi",
//       role: "Frontend Engineer",
//       bio: "Crafts beautiful and functional user experiences, combining design and clean frontend development.",
//       avatar: "/photos/bagas.png",
//       expertise: ["NextJS", "ReactJS", "TailwindCSS"],
//     },
//     {
//       name: "Muhammad Alif Shlviano",
//       role: "Backend Engineer",
//       bio: "Focuses on building scalable backend systems and managing cloud infrastructure with best practices.",
//       avatar: "/photos/alif.png",
//       expertise: ["Express.js", "MongoDB", "AWS"],
//     },
//     {
//       name: "Gladys Aisha Rizkita",
//       role: "UI/UX Designer",
//       bio: "Bridges design and development, ensuring every product decision supports both user needs and business goals.",
//       avatar: "/photos/gladys.png",
//       expertise: ["React", "Product Strategy", "UX Research"],
//     },
//     {
//       name: "Muhammad Farhan",
//       role: "Marketing Specialist",
//       bio: "Drives growth through creative campaigns and data-driven strategies that connect users to our vision.",
//       avatar: "/photos/farhan.png",
//       expertise: ["Digital Marketing", "Content Strategy", "SEO"],
//     },
//     {
//       name: "Riyan Wahyu Prasetyo",
//       role: "Graphic Designer",
//       bio: "Transforms ideas into stunning visuals that represent the heart of our brand and product identity.",
//       avatar: "/photos/riyan.png",
//       expertise: ["Branding", "Illustration", "Canva"],
//     },
//   ];

//   return (
//     <section
//       id="team"
//       className="py-20 bg-gradient-to-b from-indigo-50 via-white to-purple-50 overflow-hidden"
//     >
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Passionate experts dedicated to transforming how teams communicate
//           </p>
//         </div>

//         {/* Horizontal Scrollable Container */}
//         <div className="overflow-x-auto scrollbar-hide">
//           <div className="flex gap-8 px-4 min-w-max">
//             {teamMembers.map((member, index) => (
//               <motion.div
//                 key={index}
//                 className="relative flex-shrink-0 w-64"
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 viewport={{ once: true }}
//               >
//                 {/* Card Container */}
//                 <motion.div
//                   className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-md border border-white/10 shadow-2xl cursor-pointer"
//                   whileHover={{
//                     scale: 1.05,
//                     x: -80, // Geser ke kiri saat hover
//                     zIndex: 10,
//                   }}
//                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 >
//                   {/* Image with grayscale → color on hover */}
//                   <div className="relative h-96 w-full overflow-hidden">
//                     <Image
//                       src={member.avatar}
//                       alt={member.name}
//                       fill
//                       sizes="(max-width: 768px) 100vw, 300px"
//                       className="object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:brightness-110"
//                     />
//                     {/* Overlay gradient */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
//                   </div>

//                   {/* Text Content */}
//                   <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
//                     <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{member.name}</h3>
//                     <p className="text-indigo-300 font-medium text-sm mb-2 drop-shadow">
//                       {member.role}
//                     </p>
//                     <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
//                       {member.bio}
//                     </p>

//                     {/* Skills */}
//                     <div className="flex flex-wrap gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
//                       {member.expertise.map((skill, i) => (
//                         <span
//                           key={i}
//                           className="bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-1 rounded-full text-xs font-medium"
//                         >
//                           {skill}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>

//         {/* Optional: Scroll indicator */}
//         <div className="flex justify-center mt-8">
//           <div className="flex gap-1">
//             {teamMembers.map((_, i) => (
//               <div key={i} className="w-2 h-2 rounded-full bg-gray-400 transition-all" />
//             ))}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default Team;

// INI YANG AWAL BANGET (1)
// "use client";

// import React from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";
// // import { Card, CardFooter, Image, Button } from "@heroui/card";

// // Define the type for team members
// interface TeamMember {
//   name: string;
//   role: string;
//   bio: string;
//   avatar: string;
//   expertise: string[];
// }

// const Team: React.FC = () => {
//   // if (typeof window === "undefined") return null;

//   const teamMembers: TeamMember[] = [
//     {
//       name: "Filbert Leonardo",
//       role: "Project Manager",
//       bio: "Leads project execution with precision and ensures backend systems are smooth and reliable.",
//       avatar: "/photos/filbert.png",
//       expertise: ["Leadership", "Node.js", "Project Planning"],
//     },
//     {
//       name: "Bagas Dwiprasandi",
//       role: "Frontend Engineer",
//       bio: "Crafts beautiful and functional user experiences, combining design and clean frontend development.",
//       avatar: "/photos/bagas.png",
//       expertise: ["NextJS", "ReactJS", "TailwindCSS"],
//     },
//     {
//       name: "Muhammad Alif Shlviano",
//       role: "Backend Engineer",
//       bio: "Focuses on building scalable backend systems and managing cloud infrastructure with best practices.",
//       avatar: "/photos/alif.png",
//       expertise: ["Express.js", "MongoDB", "AWS"],
//     },
//     {
//       name: "Gladys Aisha Rizkita",
//       role: "UI/UX Designer",
//       bio: "Bridges design and development, ensuring every product decision supports both user needs and business goals.",
//       avatar: "/photos/gladys.png",
//       expertise: ["React", "Product Strategy", "UX Research"],
//     },
//     {
//       name: "Muhammad Farhan",
//       role: "Marketing Specialist",
//       bio: "Drives growth through creative campaigns and data-driven strategies that connect users to our vision.",
//       avatar: "/photos/farhan.png",
//       expertise: ["Digital Marketing", "Content Strategy", "SEO"],
//     },
//     {
//       name: "Riyan Wahyu Prasetyo",
//       role: "Graphic Designer",
//       bio: "Transforms ideas into stunning visuals that represent the heart of our brand and product identity.",
//       avatar: "/photos/riyan.png",
//       expertise: ["Branding", "Illustration", "Canva"],
//     },
//   ];

//   return (
//     <section id="team" className="py-20 bg-gradient-to-b from-indigo-50 via-white to-purple-50">
//       <div className="container mx-auto px-6">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Passionate experts dedicated to transforming how teams communicate
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
//           {teamMembers.map((member, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: index * 0.08 }}
//               className="bg-gradient-to-br from-[#f8fafc]/90 to-[#eef2ff]/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-md hover:scale-[1.02] transition transform hover:-translate-y-2 duration-300 group"
//             >
//               <div className="flex justify-center mb-6">
//                 <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-200 shadow-md group-hover:border-indigo-500 transition-all">
//                   <Image
//                     src={member.avatar}
//                     alt={member.name}
//                     fill
//                     sizes="160px"
//                     className="object-cover"
//                   />
//                 </div>
//               </div>

//               <div className="text-center">
//                 <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-700 transition">
//                   {member.name}
//                 </h3>
//                 <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
//                 <p className="text-gray-600 text-sm mb-4">{member.bio}</p>

//                 <div className="flex flex-wrap justify-center gap-2">
//                   {member.expertise.map((skill, skillIndex) => (
//                     <span
//                       key={skillIndex}
//                       className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full text-xs text-gray-800 shadow-sm"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Team;
