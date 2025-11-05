"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Raphael Reynaldi",
      role: "CEO at SentiLoka",
      content:
        "LISN has revolutionized our team meetings. We've cut follow-up time by 70% and never miss action items anymore.",
      avatar: "/photos/raphael.jpeg",
    },
    {
      name: "Aqila Salsabila",
      role: "Marketing Specialist at Recca",
      content:
        "The real-time summaries are incredibly accurate. Our remote team collaboration has never been smoother.",
      avatar: "/photos/aqila.jpg",
    },
    {
      name: "Petra Andriyani",
      role: "CTO at WorkAbroadly",
      content:
        "As someone who attends 20+ meetings weekly, LISN has given me hours of my time back. Game changer!",
      avatar: "/photos/petra.jpeg",
    },
    {
      name: "Richly  Herald",
      role: "Backend at SentiLoka",
      content:
        "This app perfectly fits our hybrid workflow. LISN helps bridge the gap between in-person and remote attendees effortlessly.",
      avatar: "/photos/richly.jpeg",
    },
    {
      name: "Malika Difa Fitria",
      role: "Frontend at Koruna",
      content:
        "I’m amazed by how LISN summarizes every key point with precision. It’s like having a personal assistant for meetings.",
      avatar: "/photos/malika.jpeg",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: { perView: 3, spacing: 24 },
      breakpoints: {
        "(max-width: 1024px)": { slides: { perView: 2 } },
        "(max-width: 640px)": { slides: { perView: 1 } },
      },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 4000);
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });

        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-b from-cyan-100 via-blue-100 to-cyan-200"
    >
      <div className="container mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            <span className="text-cyan-600">Testimonials</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from teams transforming their workflow with LISN.
          </p>
        </div>

        {/* Slider */}
        <div ref={sliderRef} className="keen-slider max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="keen-slider__slide px-4">
              <div className="bg-white/80 backdrop-blur-lg border border-cyan-200 p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[220px]">
                <p className="text-gray-700 leading-relaxed mb-4 text-[15px] italic">{t.content}</p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{t.name}</h4>
                      <p className="text-gray-500 text-xs">{t.role}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center text-cyan-500 text-sm">{"★".repeat(5)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-10 space-x-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "bg-cyan-600 scale-110" : "bg-cyan-300 hover:bg-cyan-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

// "use client";

// import React, { useState } from "react";
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";

// interface Testimonial {
//   name: string;
//   role: string;
//   content: string;
//   avatar: string;
// }

// const Testimonials: React.FC = () => {
//   const testimonials: Testimonial[] = [
//     {
//       name: "Sarah Chen",
//       role: "Product Manager at TechCorp",
//       content: "LISN has revolutionized our team meetings. We've cut follow-up time by 70% and never miss action items anymore.",
//       avatar: "👩‍💼",
//     },
//     {
//       name: "Marcus Rodriguez",
//       role: "CTO at StartupXYZ",
//       content: "The real-time summaries are incredibly accurate. Our remote team collaboration has never been smoother.",
//       avatar: "👨‍💻",
//     },
//     {
//       name: "Emily Watson",
//       role: "Marketing Director",
//       content: "As someone who attends 20+ meetings weekly, LISN has given me hours of my time back. Game changer!",
//       avatar: "👩‍🎓",
//     },
//     {
//       name: "David Kim",
//       role: "Operations Lead at CloudBase",
//       content: "This app perfectly fits our hybrid workflow. LISN helps bridge the gap between in-person and remote attendees effortlessly.",
//       avatar: "👨‍🏫",
//     },
//     {
//       name: "Lina Ahmed",
//       role: "CEO at BrightPath",
//       content: "I’m amazed by how LISN summarizes every key point with precision. It’s like having a personal assistant for meetings.",
//       avatar: "👩‍💻",
//     },
//   ];

//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
//     {
//       loop: true,
//       mode: "free-snap",
//       slides: { perView: 3, spacing: 24 },
//       breakpoints: {
//         "(max-width: 1024px)": { slides: { perView: 2 } },
//         "(max-width: 640px)": { slides: { perView: 1 } },
//       },
//       drag: true,
//       // duration: 1000,
//       slideChanged(slider) {
//         setCurrentSlide(slider.track.details.rel);
//       },
//     },
//     [
//       (slider) => {
//         let timeout: ReturnType<typeof setTimeout>;
//         let mouseOver = false;

//         function clearNextTimeout() {
//           clearTimeout(timeout);
//         }

//         function nextTimeout() {
//           clearTimeout(timeout);
//           if (mouseOver) return;
//           timeout = setTimeout(() => {
//             slider.next();
//           }, 2500);
//         }

//         slider.on("created", () => {
//           slider.container.addEventListener("mouseover", () => {
//             mouseOver = true;
//             clearNextTimeout();
//           });
//           slider.container.addEventListener("mouseout", () => {
//             mouseOver = false;
//             nextTimeout();
//           });
//           nextTimeout();
//         });

//         slider.on("dragStarted", clearNextTimeout);
//         slider.on("animationEnded", nextTimeout);
//         slider.on("updated", nextTimeout);
//       },
//     ]
//   );

//   return (
//     <section id="testimonials" className="py-20 relative bg-gradient-to-b from-white via-sky-50/90 to-cyan-100/70 backdrop-blur-md">
//       <div className="container mx-auto px-6">
//         {/* Title */}
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold text-gray-800 mb-4">Loved by Teams Worldwide</h2>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">See what our users say about transforming their meeting culture</p>
//         </div>

//         {/* Carousel */}
//         <div ref={sliderRef} className="keen-slider max-w-6xl mx-auto">
//           {testimonials.map((t, i) => (
//             <div key={i} className="keen-slider__slide px-4">
//               <div
//                 className="bg-white/70 backdrop-blur-lg border border-cyan-100/60
//                            p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2
//                            transition-all duration-500 relative h-[280px] flex flex-col justify-between"
//               >
//                 <div>
//                   <div className="text-5xl mb-4">{t.avatar}</div>
//                   <div className="flex items-center mb-2 text-yellow-400 text-lg">{"★".repeat(5)}</div>
//                   <p className="text-gray-700 italic leading-relaxed text-sm">{t.content}</p>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-800">{t.name}</h4>
//                   <p className="text-gray-500 text-sm">{t.role}</p>
//                 </div>

//                 {/* Efek glowing lembut */}
//                 <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-200/20 to-transparent opacity-0 hover:opacity-100 blur-2xl transition duration-700"></div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Dot Navigation */}
//         <div className="flex justify-center mt-8 space-x-3">
//           {testimonials.map((_, idx) => (
//             <button key={idx} onClick={() => instanceRef.current?.moveToIdx(idx)} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === idx ? "bg-cyan-500 scale-110" : "bg-cyan-300 hover:bg-cyan-400"}`} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Testimonials;
