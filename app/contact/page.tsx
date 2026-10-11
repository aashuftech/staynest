"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Bot,
  CheckCircle,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setFormError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Contact request failed");
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setFormError(
        "Failed to send. Please email us directly at westaynest@gmail.com",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-5 pb-14 pt-32 sm:px-8 sm:pb-16 sm:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,138,67,.24),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="lux-eyebrow mb-3 text-[#d9ab59]">
            We&apos;re here to help
          </p>
          <h1 className="font-display text-5xl font-light leading-tight text-white sm:text-6xl">
            Contact Us
          </h1>
          <p className="mt-3 max-w-lg text-base text-[#d2c8b8]">
            Get assistance for your apartment search, bookings, or anything
            else.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 pt-10 sm:px-8 sm:pb-32 sm:pt-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="relative h-64 overflow-hidden rounded-[26px] border border-[#e0d9cd] bg-white shadow-[0_10px_30px_rgba(24,21,17,.06)]">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900"
                alt="Map showing the StayNest office"
                className="h-full w-full object-cover opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#211e19] shadow-lg">
                  <MapPin size={16} className="text-[#a47737]" />
                  StayNest Office
                </div>
              </div>
            </div>

            <div className="space-y-5 rounded-[26px] border border-[#383329] bg-[#171511] p-6 text-white shadow-[0_16px_36px_rgba(24,21,17,.18)] sm:p-7">
              {[
                {
                  icon: MapPin,
                  label: "Office Address",
                  value: "Sec 21 Oxford Tower Rohtak 124001",
                  href: "",
                },
                {
                  icon: Mail,
                  label: "Support Email",
                  value: "westaynest@gmail.com",
                  href: "mailto:westaynest@gmail.com",
                },
                {
                  icon: Phone,
                  label: "Phone Number",
                  value: "+120 455-7890",
                  href: "tel:+1204557890",
                },
              ].map((item, index) => (
                <div key={item.label}>
                  {index > 0 && (
                    <div className="mb-5 border-t border-white/10" />
                  )}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#b98a43]/40 bg-[#b98a43]/15 text-[#e8d5b1]">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="mb-0.5 font-semibold text-[#fffaf0]">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-[#e8d5b1] transition-colors hover:text-white"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-[#cfc2ae]">{item.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-[#383329] bg-[#171511] p-6 text-white shadow-[0_16px_36px_rgba(24,21,17,.18)]">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#b98a43]/20">
                  <Bot size={16} className="text-[#e8d5b1]" />
                </div>
                <span className="font-display text-lg font-semibold text-[#fffaf0]">
                  StayNest AI guide
                </span>
              </div>
              <p className="mb-4 text-sm leading-6 text-[#cfc2ae]">
                Ask in Hindi, English, or Hinglish about any StayNest feature.
                The AI button is available in the bottom-right corner on every
                page.
              </p>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("staynest:open-chat"))
                }
                className="lux-gold-button px-5 py-2.5 text-xs"
              >
                Chat with AI
              </button>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e0d9cd] bg-white p-6 shadow-[0_10px_30px_rgba(24,21,17,.06)] sm:p-9">
            <h2 className="font-display text-2xl font-semibold text-[#211e19] sm:text-3xl">
              Get in Touch
            </h2>
            <p className="mb-7 mt-2 text-sm text-[#756f66]">
              We will get back to you within 24 hours.
            </p>
            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b98a43]/20">
                  <CheckCircle size={28} className="text-[#a47737]" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[#211e19]">
                  Message Sent!
                </h3>
                <p className="mb-6 mt-2 text-sm text-[#756f66]">
                  We will get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="lux-outline-button px-6 py-2.5 text-xs"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea
                    className="input-field resize-none"
                    rows={5}
                    placeholder="Describe your question..."
                    value={form.message}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {formError && (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="lux-gold-button w-full"
                >
                  {sending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
