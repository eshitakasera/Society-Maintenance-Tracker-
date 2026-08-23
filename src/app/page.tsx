"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Bell, Wrench, BarChart3 } from "lucide-react";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop",
    kicker: "Society Management",
    headline: "SOCIETY",
    sub: "TRACKER",
    desc: "A premium platform for residents and admins to easily track, manage, and resolve maintenance complaints.",
  },
  {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    kicker: "Rapid Resolution",
    headline: "RAISE &",
    sub: "RESOLVE",
    desc: "Submit complaints in seconds. Admins get notified instantly. Issues get resolved faster than ever.",
  },
  {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop",
    kicker: "Full Transparency",
    headline: "TRACK",
    sub: "EVERYTHING",
    desc: "Every complaint, every action, every resolution — fully logged and visible to all stakeholders.",
  },
];

const features = [
  {
    icon: Wrench,
    title: "Complaint Management",
    desc: "Submit and track maintenance complaints — plumbing, electrical, carpentry, and more.",
    color: "bg-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Admin Control",
    desc: "Admins can prioritize, assign, and resolve issues with a full audit trail.",
    color: "bg-blue-600",
  },
  {
    icon: Bell,
    title: "Notice Board",
    desc: "Society notices and announcements pinned and visible to all residents.",
    color: "bg-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Visual insights into complaint categories, overdue issues, and resolution rates.",
    color: "bg-rose-600",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/complaints");
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((cur) => (cur + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#010b14] flex items-center justify-center text-white font-bold tracking-widest uppercase text-sm">
        Loading...
      </div>
    );
  }

  const slide = heroSlides[activeHero];

  return (
    <div className="home-full-page w-full min-h-screen bg-[#eef1ef] -mt-20">

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen overflow-hidden bg-black px-5 pt-20 pb-12 text-white sm:px-8 lg:px-14">
        {heroSlides.map((s, i) => (
          <img
            key={s.image}
            src={s.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000"
            style={{ opacity: i === activeHero ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1680px] flex-col justify-between">
          <div className="grid flex-1 items-center gap-8 grid-cols-1 md:grid-cols-2 mt-16 md:mt-28">
            {/* Left */}
            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.34em] text-[#F5A623]">
                {slide.kicker}
              </div>
              <h1 className="text-[clamp(3rem,6vw,6.5rem)] font-black uppercase leading-[0.88] tracking-tight text-white">
                {slide.headline}
                <span className="block text-white/50">{slide.sub}</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-white/75">
                {slide.desc}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#F5A623] text-black font-bold text-sm px-7 py-3 rounded-sm hover:bg-[#f3a020] transition-colors"
                >
                  Login <ArrowRight size={16} />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-bold text-sm px-7 py-3 rounded-sm hover:border-white hover:bg-white/10 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="hidden md:flex flex-col items-end gap-6 self-center">
              <div className="text-right">
                <div className="text-[clamp(3rem,4vw,5rem)] font-black leading-none text-[#F5A623]">24/7</div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-white mt-1">Monitoring</p>
              </div>
              <p className="text-sm text-white/60 max-w-xs text-right leading-relaxed">
                Built for housing societies that demand fast troubleshooting, clean escalation, and full transparency.
              </p>
              <div className="flex gap-2 mt-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveHero(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${i === activeHero ? "w-8 bg-[#F5A623]" : "w-3 bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-5 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/40 font-semibold">
            <span>Society Maintenance Tracker</span>
            <span>Est. 2024</span>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="bg-[#eef1ef] px-5 sm:px-8 lg:px-14 py-20">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#17386d]">What We Offer</div>
          <h2 className="text-[clamp(1.8rem,3.5vw,3rem)] font-black uppercase text-[#010b14] mb-12 leading-tight">
            Everything you need{" "}
            <span className="text-[#17386d]/40">to manage your society.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className={`w-10 h-10 ${color} rounded-sm flex items-center justify-center mb-5`}>
                  <Icon size={20} className="text-white" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wide text-[#010b14] mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="bg-[#17386d] px-5 sm:px-8 lg:px-14 py-14">
        <div className="mx-auto max-w-[1680px] flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#F5A623] mb-2">Get Started Today</div>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">
              Join your society&apos;s<br />maintenance network.
            </h2>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#F5A623] text-black font-bold text-sm px-7 py-3 rounded-sm hover:bg-[#f3a020] transition-colors"
            >
              Login <ArrowRight size={16} />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-bold text-sm px-7 py-3 rounded-sm hover:border-white hover:bg-white/10 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
