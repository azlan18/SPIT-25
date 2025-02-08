import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Star,
  Mail,
  ArrowRight,
  Twitter,
  Github,
  Instagram,
  MessageSquare,
  Command,
  Heart,
} from "lucide-react";

// Footer Link Component
const FooterLink = ({ href, children }) => (
  <motion.a
    href={href}
    className="flex items-center gap-2 text-[#151616]/70 hover:text-[#151616] transition-colors"
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.95 }}>
    <Command className="w-4 h-4" />
    {children}
  </motion.a>
);

// Newsletter Input Component
const NewsletterInput = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative flex"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-4 py-3 rounded-l-xl border-2 border-r-0 border-[#151616] 
          focus:outline-none focus:ring-2 ring-[#D6F32F]"
      />
      <button
        className="bg-[#D6F32F] px-6 rounded-r-xl border-2 border-[#151616] flex items-center gap-2 
          font-bold hover:bg-[#D6F32F]/80 transition-colors">
        Subscribe
        <motion.div
          animate={isHovered ? { x: [0, 5, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity }}>
          <ArrowRight className="w-5 h-5" />
        </motion.div>
      </button>
    </motion.div>
  );
};

// Social Button Component
const SocialButton = ({ icon: Icon, label, href }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ rotate: 10 }}
    whileTap={{ scale: 0.9 }}
    className="group relative w-10 h-10 bg-white rounded-xl flex items-center justify-center 
      border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] hover:shadow-[2px_2px_0px_0px_#151616] 
      hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
    <Icon className="w-5 h-5 text-[#151616]" />
    <span
      className="absolute -top-8 scale-0 group-hover:scale-100 transition-transform 
      bg-[#151616] text-white text-xs py-1 px-2 rounded">
      {label}
    </span>
  </motion.a>
);

const Footer = () => {
  return (
    <footer className="relative bg-[#ffffff] pt-20 overflow-hidden">
      {/* Top Border Design */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#151616]" />
      <div className="absolute top-2 left-0 right-0 h-1 bg-[#D6F32F]" />

      <div className="container mx-auto px-6">
        {/* Newsletter Section */}
        <motion.div
          className="max-w-2xl mx-auto text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>
          <div
            className="inline-block bg-[#D6F32F] px-4 py-1 rounded-full border-2 border-[#151616] 
            shadow-[4px_4px_0px_0px_#151616] mb-4">
            <Star className="w-5 h-5 inline-block" /> Join Our Community
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Make an Impact with GreenGauge
          </h2>
          <p className="text-[#151616]/70 mb-6">
          Make your cart count - for the planet
          </p>
          <NewsletterInput />
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16 border-t-2 border-[#151616]">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}>
              <div
                className="w-12 h-12 bg-[#D6F32F] rounded-xl flex items-center justify-center 
                border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
                <Bot className="w-7 h-7 text-[#151616]" />
              </div>
              <h2 className="text-3xl font-bold">GreenGauge</h2>
            </motion.div>
            <p className="text-[#151616]/70 max-w-md">
              Empower your choices, empower the planet. Every time you make a sustainable purchase, you're not just shopping — you're creating a positive impact on the world. Your decisions today shape a better tomorrow for everyone.
            </p>
            <div className="flex gap-4">
              <SocialButton icon={Twitter} label="Twitter" href="#" />
              <SocialButton icon={Github} label="GitHub" href="#" />
              <SocialButton icon={Instagram} label="Instagram" href="#" />
              <SocialButton icon={MessageSquare} label="Discord" href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Navigation</h3>
            <div className="space-y-3">
              <FooterLink href="#">Features</FooterLink>
              <FooterLink href="#">Place Holder</FooterLink>
              <FooterLink href="#">Place holder</FooterLink>
              <FooterLink href="#">Place Holder</FooterLink>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Resources</h3>
            <div className="space-y-3">
              <FooterLink href="#">Help Center</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Use</FooterLink>
              <FooterLink href="#">Contact Support</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="border-t-2 border-[#151616]/10 py-6 flex flex-col md:flex-row 
          justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#151616]/70">
            <span>© 2025 GreenGauge. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-[#D6F32F]" /> by Team
              DedSec
            </span>
          </div>

          <motion.div
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border-2 
              border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
            whileHover={{ y: -2 }}>
            <span className="w-2 h-2 bg-[#D6F32F] rounded-full animate-pulse" />
            <span className="text-sm font-medium">Support Available 24/7</span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;