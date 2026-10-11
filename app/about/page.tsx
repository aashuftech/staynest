"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import {
  Shield,
  Database,
  Cpu,
  Target,
  Heart,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  { value: 14250, suffix: "+", label: "Properties" },
  { value: 50000, suffix: "+", label: "Happy Guests" },
  { value: 100, suffix: "+", label: "Cities" },
  { value: 4.9, suffix: "★", label: "Rating", decimals: 1 },
];

function AnimatedStats() {
  const elementRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState(stats.map(() => 0));
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const startedAt = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValues(stats.map((stat) => stat.value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [started]);
  return (
    <section ref={elementRef} className="bg-[#171511] py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 text-center sm:px-8 md:grid-cols-4 lg:px-10">
        {stats.map((stat, index) => (
          <div key={stat.label}>
            <div className="font-display text-4xl font-semibold text-white sm:text-5xl">
              {stat.decimals
                ? values[index].toFixed(stat.decimals)
                : Math.round(values[index]).toLocaleString()}
              {stat.suffix}
            </div>
            <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8d5b1]/80">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#0e0d0b] pb-20 pt-32 sm:pb-28 sm:pt-40">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0d0b]/60 via-[#0e0d0b]/80 to-[#0e0d0b]" />
        <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-10">
          <Reveal>
            <p className="lux-eyebrow mb-4">Who we are</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-5xl font-light leading-tight text-white sm:text-6xl">
              About StayNest
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/60">
              We are on a mission to make apartment searching stress-free,
              transparent, and intelligent.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal variant="zoom">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=85"
                alt="Our team"
                className="h-[420px] w-full rounded-[26px] object-cover shadow-[0_25px_70px_rgba(24,21,17,.16)]"
              />
            </Reveal>
            <div>
              <Reveal>
                <h2 className="font-display text-4xl font-semibold leading-tight text-[#211e19] sm:text-5xl">
                  Our Story and Vision
                </h2>
              </Reveal>
              <div className="mt-8 space-y-7">
                {[
                  {
                    icon: Target,
                    title: "Mission",
                    desc: "Revolutionize the apartment search experience in your city — making it faster, smarter, and completely stress-free through AI-powered matching and verified listings.",
                  },
                  {
                    icon: Cpu,
                    title: "Technology",
                    desc: "We use advanced AI powered by Claude (Anthropic) to provide precise matching between renters and properties, analyzing hundreds of data points to find your perfect home.",
                  },
                  {
                    icon: Heart,
                    title: "Values",
                    desc: "Trust is at our core. We verify every listing, protect every payment, and stand behind our renters and landlords with complete transparency.",
                  },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={i * 90}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#b98a43]/45 text-[#a47737]">
                        <item.icon size={19} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-[#211e19]">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-6 text-[#756f66]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatedStats />

      <section className="bg-[#f8f6f1] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-10">
          <Reveal>
            <p className="lux-eyebrow mb-3 text-[#a47737]">
              The people behind it
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="font-display text-4xl font-semibold text-[#211e19] sm:text-5xl">
              Meet Our Team
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mb-14 mt-3 max-w-xl text-sm text-[#756f66]">
              Engineers, designers, and real estate experts passionate about
              housing.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {[
              { n: "Sarah Chen", r: "CEO & Co-Founder", i: "SC" },
              { n: "Marcus Johnson", r: "CTO", i: "MJ" },
              { n: "Priya Sharma", r: "Head of AI", i: "PS" },
              { n: "Carlos Rivera", r: "Head of Design", i: "CR" },
            ].map((m, i) => (
              <Reveal key={m.n} delay={i * 90}>
                <div className="group rounded-[22px] border border-[#e0d9cd] bg-white p-6 text-center shadow-[0_10px_30px_rgba(24,21,17,.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(24,21,17,.12)]">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#211e19] text-lg font-semibold text-[#e8d5b1] transition-colors duration-300 group-hover:bg-[#b98a43] group-hover:text-white">
                    {m.i}
                  </div>
                  <div className="font-display text-lg font-semibold text-[#211e19]">
                    {m.n}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-[#a47737]">
                    {m.r}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e9e2d6] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="rounded-[28px] border border-[#d3c9b9] bg-[#f8f6f1] p-8 md:p-12">
              <p className="lux-eyebrow mb-3 text-[#a47737]">
                Trust & security
              </p>
              <h2 className="font-display text-3xl font-semibold text-[#211e19] sm:text-4xl">
                Our Data Commitment
              </h2>
              <p className="mt-2 text-sm text-[#756f66]">
                How property data is stored and protected on MongoDB Atlas
              </p>
              <div className="mt-10 grid gap-8 md:grid-cols-3">
                {[
                  {
                    icon: Shield,
                    title: "Encrypted Storage",
                    desc: "All data encrypted at rest with AES-256. Connections secured with TLS 1.3.",
                  },
                  {
                    icon: Database,
                    title: "MongoDB Atlas",
                    desc: "Data stored in distributed MongoDB clusters with automated backups and redundancy.",
                  },
                  {
                    icon: Cpu,
                    title: "AI Only",
                    desc: "Data used exclusively for AI matching. Never sold to third parties. Fully GDPR compliant.",
                  },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={i * 90}>
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b98a43]/40 bg-[#211e19]">
                        <item.icon size={26} className="text-[#e8d5b1]" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[#211e19]">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#756f66]">
                        {item.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#12110f] py-24 sm:py-32">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#12110f]/65" />
        <Reveal className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">
            Ready to Find Your Home?
          </h2>
          <p className="mx-auto mb-9 mt-4 max-w-lg text-base leading-7 text-white/65">
            Join thousands of happy renters who found their perfect apartment
            through StayNest.
          </p>
          <Link href="/signup" className="lux-gold-button inline-flex">
            Get Started Free <ArrowUpRight size={16} />
          </Link>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
