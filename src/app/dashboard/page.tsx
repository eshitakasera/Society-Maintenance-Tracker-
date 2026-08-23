"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  FileText,
} from 'lucide-react';

type DashboardData = {
  statusCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  overdueComplaints: {
    id: string;
    title: string;
    createdAt: string;
    priority: string | null;
    user: { name: string };
  }[];
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

// Using placeholder images for the hero backgrounds (Society / Building themes)
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop',
    kicker: 'Admin Overview',
    title: 'Monitor society health and maintenance.',
    label: 'Real-time updates',
  },
  {
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    kicker: 'Rapid Response',
    title: 'Identify and resolve critical issues faster.',
    label: 'Priority routing',
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeHero, setActiveHero] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -window.innerWidth * 0.4, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: window.innerWidth * 0.4, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status]);

  if (status === "loading") return (
    <div className="min-h-screen bg-[#010b14] flex items-center justify-center text-white font-bold tracking-widest uppercase text-sm">
      Loading Session...
    </div>
  );
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  if (loading || !data) return (
    <div className="min-h-screen bg-[#010b14] flex items-center justify-center text-white font-bold tracking-widest uppercase text-sm">
      Loading Intelligence...
    </div>
  );

  const slide = heroSlides[activeHero];
  const totalOpen = (data.statusCounts['Open'] || 0) + (data.statusCounts['In Progress'] || 0);
  
  // Sort categories by count descending
  const sortedCategories = Object.entries(data.categoryCounts)
    .sort((a, b) => b[1] - a[1]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard-full-page bg-[#eef1ef] text-black w-full min-h-screen"
    >
      {/* HERO SECTION */}
      <section className="relative flex min-h-[90vh] overflow-hidden bg-black px-5 pt-20 text-white sm:px-8 sm:pt-24 lg:px-10 -mt-20">
        {heroSlides.map((item, index) => (
          <motion.img
            key={item.image}
            src={item.image}
            alt=""
            initial={false}
            animate={{ opacity: index === activeHero ? 1 : 0, scale: index === activeHero ? 1 : 1.04 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1680px] flex-col justify-between pb-10">
          <div className="grid flex-1 items-center gap-8 grid-cols-1 md:grid-cols-2 mt-10 md:mt-20">
            <div className="max-w-5xl min-w-0">
              <motion.div {...fadeUp(0.02)} className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.34em] text-[#F5A623]">
                {slide.kicker}
              </motion.div>
              <motion.h1
                key={slide.title}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-5xl text-[clamp(2.5rem,5vw,6rem)] font-black uppercase leading-[0.88] tracking-normal text-white"
              >
                Society
                <span className="block text-white/55">Dashboard</span>
              </motion.h1>
              <motion.p {...fadeUp(0.18)} className="mt-8 max-w-2xl text-xl leading-8 text-white/80 sm:text-2xl">
                {slide.title}
              </motion.p>
            </div>

            <motion.aside
              {...fadeUp(0.25)}
              className="bg-transparent py-4 md:self-center md:justify-self-end text-left md:text-right"
            >
              <div className="mb-6 flex flex-col md:items-end gap-y-1">
                <div className="text-white text-[clamp(3rem,4vw,6rem)] font-black leading-none text-[#F5A623]">
                  {totalOpen}
                </div>
                <p className="min-w-0 text-base font-black uppercase leading-7 tracking-[0.22em] text-white">
                  Active Issues
                </p>
              </div>
              <p className="mb-7 text-sm md:text-base font-medium leading-relaxed text-white/70 max-w-sm ml-auto">
                Built for administrators that need fast troubleshooting, clean escalation, and real-time oversight of society infrastructure.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Link
                  href="/complaints"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                >
                  Manage Complaints <ArrowRight size={17} />
                </Link>
              </div>
            </motion.aside>
          </div>

          <div className="mt-20 flex flex-col gap-5 border-t border-white/15 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="max-w-3xl text-lg font-black uppercase leading-tight tracking-[0.22em] text-white/70 sm:text-2xl sm:leading-none sm:tracking-[0.28em]">
              Centralized Maintenance
            </div>
            <div className="flex shrink-0 items-center gap-3 self-start sm:self-end pb-0.5">
              {heroSlides.map((item, index) => (
                <button
                  key={item.kicker}
                  type="button"
                  onClick={() => setActiveHero(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeHero === index ? 'w-12 bg-[#F5A623]' : 'w-2.5 bg-white/35 hover:bg-white/60'
                  }`}
                  aria-label={`Show ${item.kicker} slide`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATUS BAND (Equivalent to Dark Band) */}
      <section className="bg-black px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1680px] gap-8 md:grid-cols-3">
          {[
            ['01', 'Open', data.statusCounts['Open'] || 0, 'New complaints awaiting admin review and assignment.', 'text-amber-500'],
            ['02', 'In Progress', data.statusCounts['In Progress'] || 0, 'Issues currently being addressed by the maintenance team.', 'text-blue-500'],
            ['03', 'Resolved', data.statusCounts['Resolved'] || 0, 'Successfully completed maintenance requests.', 'text-emerald-500'],
          ].map(([number, title, count, body, colorClass]) => (
            <div key={title as string} className="border-t border-white/18 pt-6">
              <div className="mb-4 text-sm font-semibold text-white/40">{number}</div>
              <div className="flex items-end gap-4 mb-3">
                <h2 className="text-3xl font-semibold tracking-normal text-white">{title}</h2>
                <span className={`text-4xl font-black ${colorClass}`}>{count}</span>
              </div>
              <p className="max-w-sm text-sm leading-7 text-white/58">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OVERDUE CAROUSEL (Equivalent to Connected Equipment) */}
      {data.overdueComplaints.length > 0 && (
        <section className="relative bg-[#eef1ef] pt-16 pb-16 overflow-hidden">
          <div className="flex flex-col">
            <div className="mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-10">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-rose-600">
                <AlertTriangle size={16} /> Action Required
              </div>
              <h2 className="text-[clamp(2.4rem,5.5vw,5rem)] font-black uppercase leading-[0.9] tracking-normal text-black mb-2">
                Overdue Issues
              </h2>
              <p className="text-black/60 font-medium max-w-xl">Complaints open for more than a set threshold. These require immediate escalation to prevent further delays in society maintenance.</p>
            </div>

            <div className="mt-10 relative group mx-auto w-full max-w-[1680px]">
              <div 
                ref={carouselRef}
                className="flex gap-6 px-5 sm:px-8 lg:px-10 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {data.overdueComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="w-[320px] shrink-0 sm:w-[380px] md:w-[440px] lg:w-[480px] snap-center"
                  >
                    <Link href={`/complaints?id=${c.id}`} className="block h-full group/card">
                      <div className="bg-white h-full rounded-[28px] p-8 shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
                        <div>
                          <div className="flex justify-between items-start mb-5">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${c.priority === 'High' ? 'bg-rose-100 text-rose-700' : c.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                              {c.priority || 'Unset'} Priority
                            </span>
                            <span className="text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Clock size={12} strokeWidth={3} /> Overdue
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2 group-hover/card:text-[#F5A623] transition-colors line-clamp-2">{c.title}</h3>
                        </div>
                        
                        <div className="mt-8 flex items-center gap-3 pt-5 border-t border-slate-100">
                           <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                             {c.user.name.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-800 leading-none">{c.user.name}</p>
                             <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {data.overdueComplaints.length > 2 && (
                <>
                  <button 
                    onClick={scrollLeft}
                    className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-black shadow-lg transition hover:bg-slate-50 z-10"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={22} strokeWidth={2} />
                  </button>
                  <button 
                    onClick={scrollRight}
                    className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-black shadow-lg transition hover:bg-slate-50 z-10"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={22} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CAPABILITY CARDS (Categories) */}
      <section className="px-5 pt-16 pb-24 sm:px-8 lg:px-10 bg-white">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-4xl text-[clamp(3rem,7vw,7.5rem)] font-black uppercase leading-[0.86] tracking-normal text-black">
              Category Intelligence
            </h2>
            <p className="max-w-md text-sm leading-7 text-black/58">
              A focused breakdown of issues across different maintenance domains to help allocate society resources efficiently.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {sortedCategories.slice(0, 3).map(([category, count], index) => {
              let bgImg = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2071&auto=format&fit=crop';
              const catLower = category.toLowerCase();
              if (catLower.includes('clean')) {
                bgImg = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop';
              } else if (catLower.includes('plumb') || catLower.includes('water')) {
                bgImg = 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=2070&auto=format&fit=crop';
              } else if (catLower.includes('electric') || catLower.includes('power')) {
                bgImg = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop';
              } else if (catLower.includes('securit')) {
                bgImg = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2064&auto=format&fit=crop';
              } else if (catLower.includes('carpenter') || catLower.includes('wood')) {
                bgImg = 'https://images.unsplash.com/photo-1540638349517-3abd5afc5fe3?q=80&w=2070&auto=format&fit=crop';
              }
              
              return (
              <article
                key={category}
                className={`group relative overflow-hidden rounded-[28px] bg-zinc-950 text-white ${
                  index === 0 ? 'min-h-[430px] md:col-span-2' : 'min-h-[360px]'
                }`}
              >
                {/* Simulated Image Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${bgImg})` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
                
                <div className="relative z-10 flex h-full max-w-xl flex-col justify-between p-7 sm:p-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
                      <FileText size={18} className="text-[#F5A623]" />
                      Domain
                    </div>
                    <span className="text-5xl font-black text-white/10">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <h3 className="mb-4 text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
                      {category}
                    </h3>
                    <p className="max-w-md text-sm leading-7 text-white/70 uppercase tracking-widest font-bold">
                      {count} Total Associated Complaints
                    </p>
                  </div>
                </div>
              </article>
            )})}
            
            {sortedCategories.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 font-semibold border-2 border-dashed border-slate-200 rounded-3xl">
                No categorical data available yet.
              </div>
            )}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
