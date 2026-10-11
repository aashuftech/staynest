"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listingNotice, setListingNotice] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPath = params.get("next");

    setListingNotice(params.get("reason") === "listing");
    if (requestedPath?.startsWith("/list-property/add?"))
      setNextPath(requestedPath);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create your account.");
        return;
      }

      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginResult?.error) {
        router.push("/login");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Unable to create your account right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = () => {
    signIn("google", { callbackUrl: nextPath });
  };

  return (
    <main className="min-h-screen bg-[#11100e] text-[#201d18]">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:flex lg:min-h-screen lg:items-center lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(216,165,66,0.20),transparent_30%),radial-gradient(circle_at_88%_86%,rgba(255,255,255,0.08),transparent_27%)]" />

        <div
          className={`relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-[#1b1915] shadow-[0_30px_100px_rgba(0,0,0,0.48)] lg:grid-cols-[0.92fr_1.08fr] ${listingNotice ? "lg:min-h-[820px]" : "lg:h-[min(720px,calc(100vh-8rem))]"}`}
        >
          <div className="order-2 flex bg-[#fffdf9] p-6 sm:p-8 lg:order-1 lg:p-9">
            <div className="my-auto w-full">
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a76d16] transition hover:text-[#211d17]"
              >
                Back to StayNest <ArrowUpRight size={15} />
              </Link>

              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b97a1e]">
                Join StayNest
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#211e19]">
                Start with a place in mind.
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#786f64]">
                Create one account for renting, buying, and offering your own
                property.
              </p>

              {listingNotice && (
                <div className="mt-6 flex gap-3 rounded-2xl border border-[#ecd7a8] bg-[#fff8e8] p-4 text-sm leading-5 text-[#73531c]">
                  <Sparkles className="mt-0.5 shrink-0" size={18} />
                  <span>
                    Create your account to request a new property listing. Your
                    request will then be sent to the admin for review.
                  </span>
                </div>
              )}

              {error && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-[#302b25]">
                  Full name
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[#e2d9cc] bg-white px-4 py-2.5 text-[#25211c] outline-none transition placeholder:text-[#a59a8b] focus:border-[#bf862b] focus:ring-4 focus:ring-[#d59b3d]/10"
                    value={form.name}
                    placeholder="Your name"
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-[#302b25]">
                  Email address
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[#e2d9cc] bg-white px-4 py-2.5 text-[#25211c] outline-none transition placeholder:text-[#a59a8b] focus:border-[#bf862b] focus:ring-4 focus:ring-[#d59b3d]/10"
                    type="email"
                    value={form.email}
                    placeholder="you@example.com"
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-[#302b25]">
                  Create password
                  <span className="relative mt-1.5 block">
                    <input
                      className="w-full rounded-xl border border-[#e2d9cc] bg-white px-4 py-2.5 pr-12 text-[#25211c] outline-none transition placeholder:text-[#a59a8b] focus:border-[#bf862b] focus:ring-4 focus:ring-[#d59b3d]/10"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      onChange={(event) =>
                        setForm({ ...form, password: event.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#9a8e7e] hover:text-[#2b2721]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </span>
                </label>

                <button
                  disabled={loading}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c0872c] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(177,117,29,0.23)] transition hover:bg-[#25211c] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : null}
                  {loading ? "Creating account…" : "Create your account"}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3 text-xs text-[#998e80]">
                <span className="h-px flex-1 bg-[#e5ded4]" />
                or join with
                <span className="h-px flex-1 bg-[#e5ded4]" />
              </div>

              <button
                type="button"
                onClick={signupWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#ded6ca] bg-white px-5 py-3 text-sm font-semibold text-[#29251f] transition hover:border-[#bf862b] hover:bg-[#fffaf0]"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#4285f4] text-xs font-bold text-white">
                  G
                </span>
                Continue with Google
              </button>

              <p className="mt-5 text-center text-sm text-[#766d62]">
                Already have an account?{" "}
                <Link
                  href={`/login${listingNotice ? `?reason=listing&next=${encodeURIComponent(nextPath)}` : ""}`}
                  className="font-bold text-[#a96e17] hover:text-[#211d17]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <aside className="relative order-1 min-h-[270px] overflow-hidden lg:order-2 lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
              alt="A warm and modern StayNest interior"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(245deg,rgba(8,7,5,0.84),rgba(17,13,7,0.26)_64%,rgba(8,7,5,0.58))]" />

            <div className="relative flex h-full min-h-[270px] flex-col justify-between p-7 text-white sm:p-9">
              <div className="ml-auto max-w-md lg:ml-0">
                <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f3c46c] backdrop-blur">
                  <Sparkles size={14} /> A better way home
                </p>
                <h2 className="text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-5xl">
                  Make space for your next chapter.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
                  From your first saved home to your first listing, StayNest
                  keeps every step clear and considered.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {["Verified homes and owners", "One place for every plan"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white/90 backdrop-blur-md"
                    >
                      <Check size={16} className="shrink-0 text-[#efbd61]" />{" "}
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
