"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Leaf,
  Scan,
  History,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Droplets,
  Trophy,
  Mail,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Scan,
      title: "Neural Scanner",
      desc: "Advanced AI identifies plant diseases with over 98% accuracy in seconds.",
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    },
    {
      icon: Droplets,
      title: "Growth Protocol",
      desc: "Personalized watering and fertilization reminders tailored to your specimen.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: History,
      title: "Scan Matrix",
      desc: "Keep a detailed history of your plant health and observations over time.",
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-pink-500/30">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-500 py-6 px-4 sm:px-12",
        scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
            <div className="p-2 sm:p-2.5 bg-pink-500 rounded-xl shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tighter uppercase italic">
              Plant<span className="text-pink-500">Care</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'About', 'Contact'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-pink-500 transition-colors">
                {item}
              </Link>
            ))}
            <Link href="/dashboard" className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5">
              Enter App
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[99] md:hidden bg-white dark:bg-slate-900 p-8 pt-32 flex flex-col gap-8"
          >
            {['Features', 'About', 'Contact'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                {item}
              </Link>
            ))}
            <Link href="/dashboard" className="w-full py-6 bg-pink-500 text-white rounded-[2rem] text-center font-black text-xl uppercase tracking-widest mt-auto">
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-pink-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full" />

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                <Trophy className="w-3 h-3" />
                #1 Plant Diagnostic AI System
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] mb-8">
                Heal Your Plants with <span className="text-pink-500 italic">Neural Intelligence.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Identify diseases, receive personalized growth protocols, and transform your space into a thriving greenhouse with our advanced specimen analytics.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-pink-500 hover:bg-pink-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3 active:scale-95 group">
                  Start Free Scan
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all active:scale-95 text-center">
                  Live Demo
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square w-full max-w-[500px] ml-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[4rem] rotate-6 shadow-2xl opacity-20" />
                <div className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[4rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-pink-500/10 rounded-full flex items-center justify-center mb-6">
                    <Scan className="w-16 h-16 text-pink-500 animate-pulse" />
                  </div>
                  <div className="px-8 text-center">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">specimen.neural_scan</h3>
                    <p className="text-xs font-black text-pink-500 uppercase tracking-[0.3em]">Analyzing Cell Structure...</p>
                  </div>
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 animate-bounce hidden lg:block">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500 rounded-2xl">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-900 dark:text-white">98.4%</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-white dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-4 leading-none">
                Powerful Features for <br /><span className="text-pink-500 italic">Advanced Botanists</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-[0.4rem]">Next-Gen Growth Protocols</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-10 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[3rem] hover:bg-white dark:hover:bg-white/10 hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-500 group"
                >
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform", feature.bg)}>
                    <feature.icon className={cn("w-8 h-8", feature.color)} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4 italic">
                    0{i + 1}. {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile-First Layout Demo */}
        <section id="about" className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-5xl mx-auto p-8 sm:p-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[4rem] relative shadow-2xl overflow-hidden text-center text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <Smartphone className="w-16 h-16 mx-auto mb-8 text-white/50" />
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-none uppercase italic">
                Perfectly Responsive <br />on Every Device.
              </h2>
              <p className="text-lg md:text-xl font-bold text-pink-100 max-w-2xl mx-auto mb-10 leading-relaxed uppercase tracking-tighter">
                Whether you&apos;re in the garden with your phone or at your desk with a widescreen Retina display, PlantCare adapts perfectly to your viewing matrix.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-10">
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Mobile First</span>
                </div>
                <div className="flex flex-col items-center">
                  <Smartphone className="w-8 h-8 mb-2 rotate-90" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Tablet Ready</span>
                </div>
                <div className="flex flex-col items-center">
                  <Trophy className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Retina HD</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-500 rounded-xl">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">
                Plant<span className="text-pink-500">Care</span>
              </span>
            </div>
            <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xs">
              The worlds most advanced botanical intelligence system. Secure, precise, and decentralized.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4rem] mb-10 italic">Quick Protocols</h4>
            <div className="flex flex-col gap-4">
              {['Home', 'AI Scanner', 'History', 'Workspace'].map(item => (
                <Link key={item} href="#" className="text-sm font-black text-slate-400 hover:text-white transition-colors">{item}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4rem] mb-10 italic">Neural Connection</h4>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 group">
                <Mail className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black text-slate-400 group-hover:text-white transition-colors">support@plantcare.ai</span>
              </div>
              <div className="flex items-center gap-4 group">
                <Phone className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black text-slate-400 group-hover:text-white transition-colors">+1 (555) NEURAL-0</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4rem] mb-10 italic">Access Matrix</h4>
            <p className="text-sm font-black text-slate-400 leading-relaxed mb-6">
              Silicon Valley Core v2.0<br />Decentralized Network Node
            </p>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            &copy; 2026 PlantCare AI Neural Network. All Rights Reserved.
          </p>
          <div className="flex gap-10">
            {['Privacy', 'Legal', 'Status'].map(item => (
              <Link key={item} href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-pink-500 transition-colors">
                {item}.protocol
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
