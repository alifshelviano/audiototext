"use client";

// src/app/page.tsx
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import Team from "../components/Team";
import Contact from "../components/Contact";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Header />
      <Hero />
      <About />
      <Services />
      <Pricing />
      <Testimonials />
      <Team />
      <Contact />
      {/* <Footer /> */}
    </main>
  );
}
