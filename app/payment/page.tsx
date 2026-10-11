"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { CheckCircle, ExternalLink, Loader2, ShieldCheck } from "lucide-react";

function PaymentContent() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");
  const sessionId = params.get("session_id");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (!bookingId) {
      router.push("/dashboard");
      return;
    }
    (async () => {
      try {
        if (sessionId) {
          const response = await fetch("/api/payment/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId, checkoutSessionId: sessionId }),
          });
          const data = await response.json();
          if (!response.ok)
            setError(data.error || "Payment verification failed.");
          else {
            setBooking(data.booking);
            setPaid(true);
            return;
          }
        }
        const response = await fetch(`/api/bookings/${bookingId}`);
        const data = await response.json();
        if (!response.ok) setError(data.error || "Unable to load booking.");
        else setBooking(data.booking);
      } catch {
        setError("Unable to load payment details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, router, sessionId, status]);

  const pay = async () => {
    if (!agreed) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }
    setPaying(true);
    setError("");
    try {
      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl)
        setError(data.error || "Unable to start secure checkout.");
      else window.location.assign(data.checkoutUrl);
    } catch {
      setError("Unable to start secure checkout.");
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  const isPurchase = booking?.bookingType === "PURCHASE_RESERVATION";
  const bookedOn = booking?.createdAt || booking?.checkIn;

  if (paid)
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h1 className="text-2xl font-bold">Payment successful</h1>
          <p className="mt-2 text-gray-600">
            Your {isPurchase ? "property reservation" : "booking"} is confirmed.
          </p>
          <Link
            className="btn-primary mt-6 inline-block"
            href="/dashboard/bookings"
          >
            View my bookings
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28">
        <h1 className="mb-8 text-3xl font-bold">Secure Payment Gateway</h1>
        <div className="grid gap-8 lg:grid-cols-5">
          <aside className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <h2 className="mb-5 text-lg font-bold">
                {isPurchase ? "Reservation Summary" : "Booking Summary"}
              </h2>
              {booking && (
                <>
                  <img
                    src={booking.property?.images?.[0]}
                    alt=""
                    className="mb-4 h-36 w-full rounded-2xl object-cover"
                  />
                  <h3 className="font-bold">{booking.property?.title}</h3>
                  <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                    {isPurchase ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Booked on</span>
                          <strong>
                            {new Date(bookedOn).toLocaleDateString()}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Purchase deadline
                          </span>
                          <strong>
                            {new Date(
                              booking.reservationDeadline || booking.checkOut,
                            ).toLocaleDateString()}
                          </strong>
                        </div>
                        <div className="flex justify-between border-t pt-3">
                          <span className="font-semibold">Booking price</span>
                          <strong>
                            ${booking.totalAmount?.toLocaleString()}
                          </strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Check-in</span>
                          <strong>
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Check-out</span>
                          <strong>
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </strong>
                        </div>
                        <div className="flex justify-between border-t pt-3">
                          <span className="font-semibold">Total Amount</span>
                          <strong>
                            ${booking.totalAmount?.toLocaleString()}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>
          <section className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <h2 className="text-xl font-bold">Secure payment with Stripe</h2>
              <div className="my-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <ShieldCheck className="shrink-0 text-amber-700" />
                <p className="text-sm leading-6 text-gray-700">
                  You will complete this payment securely on Stripe Checkout.
                  StayNest never stores your card or bank details.
                </p>
              </div>
              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5"
                />
                I agree to the StayNest Terms & Conditions and Privacy Policy.
              </label>
              {error && (
                <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}
              <button
                onClick={pay}
                disabled={paying || !agreed}
                className="btn-primary flex w-full items-center justify-center gap-2 py-4 disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Opening checkout...
                  </>
                ) : (
                  <>
                    <ExternalLink size={18} />
                    Continue to secure payment $
                    {booking?.totalAmount?.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
