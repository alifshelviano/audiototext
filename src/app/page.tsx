"use client";

// src/app/page.tsx
import Header from "../components/app/landing/Header";
import Hero from "../components/app/landing/Hero";
import About from "../components/app/landing/About";
import Services from "../components/app/landing/Services";
import Pricing from "../components/app/landing/Pricing";
import Testimonials from "../components/app/landing/Testimonials";
import Team from "../components/app/landing/Team";
import Contact from "../components/app/landing/Contact";

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
