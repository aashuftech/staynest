"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, MapPin, Upload, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const initialForm = {
  title: "",
  description: "",
  type: "FLAT",
  city: "",
  neighborhood: "",
  address: "",
  contactNo: "",
  pricePerMonth: "",
  securityDeposit: "",
  finalPrice: "",
  bookingPrice: "",
  bedrooms: "1",
  bathrooms: "1",
  area: "",
  maxGuests: "2",
};
const types = ["FLAT", "HOUSE", "STUDIO", "CONDO", "TOWNHOUSE", "VILLA"];

export default function OwnerAddPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingPurpose =
    searchParams.get("listingPurpose") === "BUY" ? "BUY" : "RENT";
  const editId = searchParams.get("edit");
  const reregisterId = searchParams.get("reregister");
  const sourceId = editId || reregisterId;
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([""]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const update = (key: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!sourceId) return;
    fetch("/api/owner-properties/mine")
      .then((response) => response.json())
      .then((data) => {
        const property = (data.properties || []).find(
          (item: any) => item._id === sourceId,
        );
        if (!property) {
          setError("This listing could not be found.");
          return;
        }
        setForm({
          title: property.title || "",
          description: property.description || "",
          type: property.type || "FLAT",
          city: property.city || "",
          neighborhood: property.neighborhood || "",
          address: property.address || "",
          contactNo: property.ownerContact || "",
          pricePerMonth: property.pricePerMonth?.toString() || "",
          securityDeposit: property.securityDeposit?.toString() || "",
          finalPrice: property.finalPrice?.toString() || "",
          bookingPrice: property.bookingPrice?.toString() || "",
          bedrooms: property.bedrooms?.toString() || "1",
          bathrooms: property.bathrooms?.toString() || "1",
          area: property.area?.toString() || "",
          maxGuests: property.maxGuests?.toString() || "2",
        });
        setImages(property.images?.length ? property.images : [""]);
      })
      .catch(() => setError("Unable to load your listing."));
  }, [sourceId]);

  const citySearch = async (value: string) => {
    update("city", value);
    requestRef.current?.abort();
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const data = await fetch(
        `/api/locations?q=${encodeURIComponent(value)}`,
        { signal: controller.signal },
      ).then((response) => response.json());
      if (!controller.signal.aborted) setSuggestions(data.locations || []);
    } catch {
      setSuggestions([]);
    }
  };

  const uploadPropertyImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingImages(true);
    setError("");
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const body = new FormData();
          body.append("file", file);
          body.append("scope", "property");
          const response = await fetch("/api/uploads/image", {
            method: "POST",
            body,
          });
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.error || `Unable to upload ${file.name}.`);
          return data.url as string;
        }),
      );
      setImages((current) => [...current.filter(Boolean), ...uploaded]);
    } catch (err: any) {
      setError(err.message || "Unable to upload image.");
    } finally {
      setUploadingImages(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const requestId = editId || reregisterId;
    try {
      const response = await fetch(
        requestId
          ? `/api/owner-properties/${requestId}`
          : "/api/owner-properties",
        {
          method: requestId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            listingPurpose,
            reregister: Boolean(reregisterId),
            images: images.filter(Boolean),
            pricePerMonth:
              listingPurpose === "RENT"
                ? Number(form.pricePerMonth)
                : undefined,
            securityDeposit:
              listingPurpose === "RENT"
                ? Number(form.securityDeposit || 0)
                : undefined,
            finalPrice:
              listingPurpose === "BUY" ? Number(form.finalPrice) : undefined,
            bookingPrice:
              listingPurpose === "BUY" ? Number(form.bookingPrice) : undefined,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to save your listing.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Unable to save your listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const input = (
    key: keyof typeof initialForm,
    label: string,
    required = false,
    type = "text",
  ) => (
    <div>
      <label className="label text-[#575149]">
        {label}
        {required && " *"}
      </label>
      <input
        required={required}
        type={type}
        className="input-field border-[#ded7ca] bg-[#faf9f6] text-[#211e19] focus:border-[#b98a43]"
        value={form[key]}
        onChange={(event) => update(key, event.target.value)}
      />
    </div>
  );
  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,138,67,.22),transparent_45%)]" />
        <div className="relative mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-[#d9ab59]">
              {listingPurpose === "RENT" ? "Rental listing" : "Sale listing"}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white">
              {editId
                ? "Edit your property"
                : reregisterId
                  ? "Re-register your property"
                  : listingPurpose === "RENT"
                    ? "Rent Out your property"
                    : "Sell property"}
            </h1>
            <p className="mt-1 text-sm text-[#d2c8b8]">
              {editId
                ? "Update your property details and contact number."
                : reregisterId
                  ? "Review the details and send a new request for admin approval."
                  : "Add your property details for admin review."}
            </p>
          </div>
          <Link
            href="/list-property"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            ← Back
          </Link>
        </div>
      </section>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <form onSubmit={submit} className="space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <section className="rounded-3xl border border-[#e0d9cd] bg-white p-6 shadow-card">
            <h2 className="mb-5 text-lg font-bold text-[#211e19]">
              Basic information
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                {input("title", "Property title", true)}
              </div>
              <div className="sm:col-span-2">
                <label className="label text-[#575149]">Description *</label>
                <textarea
                  required
                  rows={4}
                  className="input-field resize-none border-[#ded7ca] bg-[#faf9f6] text-[#211e19] focus:border-[#b98a43]"
                  value={form.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                />
              </div>
              <div>
                <label className="label text-[#575149]">Property type *</label>
                <select
                  className="input-field border-[#ded7ca] bg-[#faf9f6] text-[#211e19]"
                  value={form.type}
                  onChange={(event) => update("type", event.target.value)}
                >
                  {types.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="label text-[#575149]">City *</label>
                <input
                  required
                  autoComplete="off"
                  className="input-field border-[#ded7ca] bg-[#faf9f6] text-[#211e19]"
                  value={form.city}
                  onChange={(event) => citySearch(event.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-[#ded7ca] bg-white shadow-lg">
                    {suggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          update("city", city.split(",")[0].trim());
                          setSuggestions([]);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#575149] hover:bg-[#f8f3ea]"
                      >
                        <MapPin size={13} className="text-[#a47737]" />
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {input("neighborhood", "Neighborhood")}
              {input("address", "Full address", true)}
              <div className="sm:col-span-2">
                {input("contactNo", "Contact no.", true, "tel")}
              </div>
            </div>
          </section>
          <section className="rounded-3xl border border-[#e0d9cd] bg-white p-6 shadow-card">
            <h2 className="mb-5 text-lg font-bold text-[#211e19]">
              Pricing &amp; details
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {listingPurpose === "RENT" ? (
                <>
                  {input("pricePerMonth", "Price/Month (USD)", true, "number")}
                  {input(
                    "securityDeposit",
                    "Security Deposit (USD)",
                    false,
                    "number",
                  )}
                </>
              ) : (
                <>
                  {input("finalPrice", "Final Price (USD)", true, "number")}
                  {input("bookingPrice", "Booking Price (USD)", true, "number")}
                </>
              )}
              <div>
                <label className="label text-[#575149]">Bedrooms</label>
                <select
                  className="input-field border-[#ded7ca] bg-[#faf9f6] text-[#211e19]"
                  value={form.bedrooms}
                  onChange={(event) => update("bedrooms", event.target.value)}
                >
                  {["0", "1", "2", "3", "4", "5", "6"].map((value) => (
                    <option key={value}>
                      {value === "0" ? "Studio" : value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-[#575149]">Bathrooms</label>
                <select
                  className="input-field border-[#ded7ca] bg-[#faf9f6] text-[#211e19]"
                  value={form.bathrooms}
                  onChange={(event) => update("bathrooms", event.target.value)}
                >
                  {["1", "2", "3", "4"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              {input("area", "Area (sq ft)", false, "number")}
              {listingPurpose === "RENT" && (
                <div>
                  <label className="label text-[#575149]">Max Guests</label>
                  <select
                    className="input-field border-[#ded7ca] bg-[#faf9f6] text-[#211e19]"
                    value={form.maxGuests}
                    onChange={(event) =>
                      update("maxGuests", event.target.value)
                    }
                  >
                    {["1", "2", "3", "4", "5", "6", "8", "10"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>
          <section className="rounded-3xl border border-[#e0d9cd] bg-white p-6 shadow-card">
            <h2 className="mb-2 text-lg font-bold text-[#211e19]">
              Property images
            </h2>
            <p className="mb-4 text-sm text-[#756f66]">
              Upload images from your device. PNG, JPG, WEBP or GIF · maximum 8
              MB each.
            </p>
            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#b98a43]/45 bg-[#fffaf0] px-5 text-center text-[#8d5d1d] transition hover:border-[#b98a43] hover:bg-[#f9efd9]">
              {uploadingImages ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Upload size={24} />
              )}
              <span className="text-sm font-semibold">
                {uploadingImages ? "Uploading images…" : "Upload from device"}
              </span>
              <span className="text-xs text-[#a0865d]">
                You can select multiple images at once
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={uploadingImages}
                onChange={(event) => {
                  uploadPropertyImages(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {images.filter(Boolean).length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.filter(Boolean).map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative overflow-hidden rounded-xl border border-[#e0d9cd]"
                  >
                    <img
                      src={url}
                      alt={`Property upload ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((current) =>
                          current.filter((item) => item !== url),
                        )
                      }
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/65 text-white transition hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
          <button
            type="submit"
            disabled={saving || uploadingImages}
            className="flex items-center gap-2 rounded-xl bg-[#b98a43] px-7 py-3.5 font-semibold text-white shadow-lg shadow-amber-900/20 transition hover:bg-[#9f7435] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending request...
              </>
            ) : editId ? (
              "Update listing"
            ) : (
              "Request your property for listing"
            )}
          </button>
        </form>
      </main>
      <Footer />
      {saved && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <CheckCircle className="mx-auto text-green-600" size={44} />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {editId ? "Listing updated" : "Request submitted"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {editId
                ? "Your property details have been updated."
                : "Your request has been submitted. Kindly wait for admin approval before your property is published."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <button
                onClick={() => router.push("/apartments")}
                className="btn-secondary whitespace-nowrap px-4 py-2.5 text-sm"
              >
                Browse properties
              </button>
              <button
                onClick={() => router.push("/dashboard/listings")}
                className="btn-primary whitespace-nowrap px-4 py-2.5 text-sm"
              >
                Go back
              </button>
              {!editId && (
                <button
                  onClick={() => {
                    setSaved(false);
                    setForm(initialForm);
                    setImages([""]);
                  }}
                  className="btn-secondary whitespace-nowrap px-4 py-2.5 text-sm"
                >
                  Add more
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
