"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaDiscord,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for reaching out! We’ll get back to you soon.");
    setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  };

  return (
    <>
      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Get in touch</h2>
            <p className="text-gray-600 mb-8">
              We’d love to hear from you. Please fill out this form.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="+62 (878) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                  placeholder="Leave us a message..."
                />
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="agree" className="mt-1" required />
                <label htmlFor="agree" className="text-sm text-gray-600">
                  You agree to our friendly{" "}
                  <a href="#" className="text-cyan-600 hover:underline">
                    privacy policy
                  </a>
                  .
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Right Side - Info */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">We’d love to hear from you</h3>
            <p className="text-gray-600 mb-10">
              Need something cleared up? Here are our most frequently asked questions.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-violet-50 rounded-xl">
                  <Mail className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600 text-sm">Our friendly team is here to help.</p>
                  <a
                    href="mailto:lisn.app.info@gmail.com"
                    className="text-cyan-600 text-sm font-medium hover:underline"
                  >
                    lisn.app.info@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Phone className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Phone</h4>
                  <p className="text-gray-600 text-sm">Mon–Fri from 8am to 5pm.</p>
                  <a
                    href="tel:+628781234567"
                    className="text-cyan-600 text-sm font-medium hover:underline"
                  >
                    +62 (878) 123-4567
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <MapPin className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Office</h4>
                  <p className="text-gray-600 text-sm">Come say hello at our office HQ.</p>
                  <p className="text-cyan-600 text-sm font-medium">
                    BPPTIK Kominfo, Cikarang
                    <br />
                    Bekasi, Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-cyan-50 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-4 gap-12">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="LISN Logo"
              width={45}
              height={45}
              className="object-contain"
            />
            <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-3xl tracking-tight">
              LISN<span className="text-cyan-400 dark:text-cyan-300">.</span>
            </span>
          </div>

          {/* Learn More */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Learn More</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-cyan-500">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-500">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-500">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-500">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                Email:{" "}
                <a href="mailto:lisn.app.info@gmail.com" className="text-cyan-600 hover:underline">
                  lisn.app.info@gmail.com
                </a>
              </li>
              <li>
                Phone:{" "}
                <a href="tel:+628781234567" className="text-cyan-600 hover:underline">
                  +62 (878) 123-4567
                </a>
              </li>
              <li>Office: BPPTIK Kominfo, Cikarang</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Social</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-cyan-500">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-500">
                <FaGithub size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-500">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-500">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-500">
                <FaDiscord size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-500">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-300 pt-6">
          © {new Date().getFullYear()} LISN | All Rights Reserved
        </div>
      </footer>
    </>
  );
};

export default Contact;

// "use client";

// import React, { useState, ChangeEvent, FormEvent } from "react";
// import { Mail, Phone, MapPin } from "lucide-react";

// interface FormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   message: string;
// }

// const Contact: React.FC = () => {
//   const [formData, setFormData] = useState<FormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     message: "",
//   });

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     console.log("Form submitted:", formData);
//     alert("Thank you for reaching out! We’ll get back to you soon.");
//     setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
//   };

//   return (
//     <section id="contact" className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-start">
//         {/* Left Side - Form */}
//         <div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-3">Get in touch</h2>
//           <p className="text-gray-600 mb-8">
//             We’d love to hear from you. Please fill out this form.
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid sm:grid-cols-2 gap-6">
//               <div>
//                 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
//                   First name
//                 </label>
//                 <input
//                   id="firstName"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   required
//                   className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
//                   placeholder="First name"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
//                   Last name
//                 </label>
//                 <input
//                   id="lastName"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   required
//                   className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
//                   placeholder="Last name"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
//                 placeholder="you@company.com"
//               />
//             </div>

//             <div>
//               <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone number
//               </label>
//               <input
//                 id="phone"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
//                 placeholder="+62 (878) 123-4567"
//               />
//             </div>

//             <div>
//               <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
//                 Message
//               </label>
//               <textarea
//                 id="message"
//                 name="message"
//                 value={formData.message}
//                 onChange={handleChange}
//                 required
//                 rows={5}
//                 className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
//                 placeholder="Leave us a message..."
//               />
//             </div>

//             <div className="flex items-start space-x-2">
//               <input type="checkbox" id="agree" className="mt-1" required />
//               <label htmlFor="agree" className="text-sm text-gray-600">
//                 You agree to our friendly{" "}
//                 <a href="#" className="text-violet-600 hover:underline">
//                   privacy policy
//                 </a>.
//               </label>
//             </div>

//             <button
//               type="submit"
//               className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 hover:opacity-90 transition"
//             >
//               Send Message
//             </button>
//           </form>
//         </div>

//         {/* Right Side - Info */}
//         <div>
//           <h3 className="text-3xl font-bold text-gray-900 mb-3">We’d love to hear from you</h3>
//           <p className="text-gray-600 mb-10">
//             Need something cleared up? Here are our most frequently asked questions.
//           </p>

//           <div className="space-y-8">
//             {/* Email */}
//             <div className="flex items-start space-x-4">
//               <div className="p-3 bg-violet-50 rounded-xl">
//                 <Mail className="w-6 h-6 text-violet-500" />
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-900">Email</h4>
//                 <p className="text-gray-600 text-sm">Our friendly team is here to help.</p>
//                 <a href="mailto:hi@agency.com" className="text-violet-600 text-sm font-medium hover:underline">
//                   hi@agency.com
//                 </a>
//               </div>
//             </div>

//             {/* Phone */}
//             <div className="flex items-start space-x-4">
//               <div className="p-3 bg-purple-50 rounded-xl">
//                 <Phone className="w-6 h-6 text-purple-500" />
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-900">Phone</h4>
//                 <p className="text-gray-600 text-sm">Mon–Fri from 8am to 5pm.</p>
//                 <a href="+62 (878) 123-4567" className="text-violet-600 text-sm font-medium hover:underline">
//                   +62 (878) 123-4567
//                 </a>
//               </div>
//             </div>

//             {/* Office */}
//             <div className="flex items-start space-x-4">
//               <div className="p-3 bg-green-50 rounded-xl">
//                 <MapPin className="w-6 h-6 text-cyan-500" />
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-900">Office</h4>
//                 <p className="text-gray-600 text-sm">Come say hello at our office HQ.</p>
//                 <p className="text-violet-600 text-sm font-medium">
//                   100 Smith Street<br />Collingwood VIC 3066 AU
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Contact;

// "use client";

// import React, { useState, ChangeEvent, FormEvent } from "react";
// import { FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";

// interface FormData {
//   name: string;
//   email: string;
//   company: string;
//   message: string;
// }

// const Contact: React.FC = () => {
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     company: "",
//     message: "",
//   });

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     console.log("Form submitted:", formData);
//     alert("Thank you for your message! We'll get back to you soon.");
//     setFormData({ name: "", email: "", company: "", message: "" });
//   };

//   return (
//     <section id="contact" className="py-20 bg-gradient-to-br from-white via-cyan-50 to-cyan-100">
//       <div className="container mx-auto px-6">
//         {/* Header */}
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold text-gray-800 mb-4">Get In Touch</h2>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">Ready to transform your meetings? Let’s start the conversation.</p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
//           {/* Form */}
//           <div>
//             <form onSubmit={handleSubmit} className="space-y-6 bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-md">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//                     Full Name *
//                   </label>
//                   <input
//                     type="text"
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
//                     placeholder="Your name"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
//                     placeholder="your.email@company.com"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
//                   Company
//                 </label>
//                 <input
//                   type="text"
//                   id="company"
//                   name="company"
//                   value={formData.company}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
//                   placeholder="Your company"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
//                   Message *
//                 </label>
//                 <textarea
//                   id="message"
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   required
//                   rows={6}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
//                   placeholder="Tell us about your meeting challenges and how we can help..."
//                 ></textarea>
//               </div>

//               <button type="submit" className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition">
//                 Send Message
//               </button>
//             </form>
//           </div>

//           {/* Contact Info */}
//           <div className="space-y-8">
//             <div>
//               <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h3>

//               <div className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
//                     <span className="text-cyan-600 text-lg">📧</span>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Email</p>
//                     <p className="text-gray-600">lisn.app.info@gmail.com</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
//                     <span className="text-cyan-600 text-lg">🏙</span>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Office</p>
//                     <p className="text-gray-600">BPPTIK Komdigi, Cikarang</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
//                     <span className="text-cyan-600 text-lg">💬</span>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Support</p>
//                     <p className="text-gray-600">Available 24/7 for premium customers</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Social Media */}
//               <div className="mt-8">
//                 <h4 className="font-semibold text-gray-800 mb-3">Follow Us</h4>
//                 <div className="flex space-x-4">
//                   <a
//                     href="https://linkedin.com"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="p-3 rounded-full bg-white/40 backdrop-blur-md shadow-sm border border-white/20 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all duration-300"
//                   >
//                     <FaLinkedin size={20} />
//                   </a>
//                   <a
//                     href="https://facebook.com"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="p-3 rounded-full bg-white/40 backdrop-blur-md shadow-sm border border-white/20 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
//                   >
//                     <FaFacebook size={20} />
//                   </a>
//                   <a
//                     href="https://instagram.com"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="p-3 rounded-full bg-white/40 backdrop-blur-md shadow-sm border border-white/20 text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300"
//                   >
//                     <FaInstagram size={20} />
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Contact;
