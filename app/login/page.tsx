"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email address or password.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Unable to sign you in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    signIn("google", { callbackUrl: nextPath });
  };

  return (
    <main className="min-h-screen bg-[#11100e] text-[#201d18]">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:flex lg:min-h-screen lg:items-center lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,146,48,0.20),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(255,255,255,0.07),transparent_30%)]" />

        <div
          className={`relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-[#1b1915] shadow-[0_30px_100px_rgba(0,0,0,0.48)] lg:grid-cols-[1.08fr_0.92fr] ${listingNotice ? "lg:min-h-[900px]" : "lg:h-[min(680px,calc(100vh-9rem))]"}`}
        >
          <aside className="relative min-h-[270px] overflow-hidden lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"
              alt="A modern StayNest home"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(9,8,6,0.84),rgba(15,12,8,0.24)_65%,rgba(10,8,5,0.45))]" />

            <div className="relative flex h-full min-h-[270px] flex-col justify-between p-7 text-white sm:p-9">
              <div>
                <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f3c46c] backdrop-blur">
                  <ShieldCheck size={14} /> StayNest members
                </p>
                <h1 className="max-w-md text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-5xl">
                  Come home to what matters.
                </h1>
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/75 sm:text-base">
                  Discover thoughtful spaces, keep every booking organised, and
                  manage your property in one calm place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-md">
                  <p className="text-lg font-semibold">14k+</p>
                  <p className="text-[11px] text-white/65">curated homes</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-md">
                  <p className="text-lg font-semibold">4.9/5</p>
                  <p className="text-[11px] text-white/65">member rating</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex bg-[#fffdf9] p-6 sm:p-8 lg:p-9">
            <div className="my-auto w-full">
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a76d16] transition hover:text-[#211d17]"
              >
                Back to StayNest <ArrowUpRight size={15} />
              </Link>

              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b97a1e]">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#211e19]">
                Sign in to your space.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#786f64]">
                Your saved homes, bookings, and listings are waiting.
              </p>

              {listingNotice && (
                <div className="mt-6 flex gap-3 rounded-2xl border border-[#ecd7a8] bg-[#fff8e8] p-4 text-sm leading-5 text-[#73531c]">
                  <ShieldCheck className="mt-0.5 shrink-0" size={18} />
                  <span>
                    You need to sign in or create an account before requesting a
                    property listing.
                  </span>
                </div>
              )}

              {error && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-[#302b25]">
                  Email address
                  <input
                    className="mt-1.5 w-full rounded-xl border border-[#e2d9cc] bg-white px-4 py-3 text-[#25211c] outline-none transition placeholder:text-[#a59a8b] focus:border-[#bf862b] focus:ring-4 focus:ring-[#d59b3d]/10"
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
                  Password
                  <span className="relative mt-1.5 block">
                    <input
                      className="w-full rounded-xl border border-[#e2d9cc] bg-white px-4 py-3 pr-12 text-[#25211c] outline-none transition placeholder:text-[#a59a8b] focus:border-[#bf862b] focus:ring-4 focus:ring-[#d59b3d]/10"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      placeholder="Enter your password"
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25211c] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,33,28,0.18)] transition hover:bg-[#b87c22] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : null}
                  {loading ? "Signing in…" : "Continue to StayNest"}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3 text-xs text-[#998e80]">
                <span className="h-px flex-1 bg-[#e5ded4]" />
                or continue with
                <span className="h-px flex-1 bg-[#e5ded4]" />
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#ded6ca] bg-white px-5 py-3 text-sm font-semibold text-[#29251f] transition hover:border-[#bf862b] hover:bg-[#fffaf0]"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#4285f4] text-xs font-bold text-white">
                  G
                </span>
                Continue with Google
              </button>

              <p className="mt-5 text-center text-sm text-[#766d62]">
                New to StayNest?{" "}
                <Link
                  href={`/signup${listingNotice ? `?reason=listing&next=${encodeURIComponent(nextPath)}` : ""}`}
                  className="font-bold text-[#a96e17] hover:text-[#211d17]"
                >
                  Create an account
                </Link>
              </p>
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-[#9a8e80]">
                <CheckCircle2 size={15} className="text-[#bc842b]" /> Secure
                access for renters, buyers, and owners.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
