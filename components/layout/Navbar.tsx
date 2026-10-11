"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  Home,
  Search,
  Info,
  Phone,
  Sparkles,
  BookOpen,
  CreditCard,
  MapPin,
  Building2,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const listingActionHref = (purpose: "RENT" | "BUY") => {
    const destination = `/list-property/add?listingPurpose=${purpose}`;
    return session
      ? destination
      : `/signup?reason=listing&next=${encodeURIComponent(destination)}`;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navBg = scrolled
    ? "bg-[#141311]/95 backdrop-blur-xl shadow-lg border-b border-white/10"
    : "bg-[#141311]/35 backdrop-blur-sm";
  const linkCls = (active: boolean) =>
    active
      ? "bg-blue-500 text-white font-semibold shadow-sm"
      : "text-white/75 hover:text-white hover:bg-white/10";

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/apartments", label: "Apartments", icon: Search },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 ${scrolled ? "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/25" : "bg-gradient-to-br from-blue-400 to-blue-600 shadow-black/20"}`}
            >
              <Home size={20} strokeWidth={2.5} />
              <MapPin
                size={9}
                strokeWidth={3}
                className="absolute bottom-1.5 right-1.5 text-blue-100"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              StayNest
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${linkCls(isActive(link.href))}`}
              >
                {link.label}
              </Link>
            ))}
            {!isAdmin && (
              <div className="group relative">
                <Link
                  href="/list-property"
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${linkCls(isActive("/list-property"))}`}
                >
                  <Building2 size={14} /> List your property{" "}
                  <ChevronDown
                    size={13}
                    className="transition-transform group-hover:rotate-180"
                  />
                </Link>
                <div className="pointer-events-none invisible absolute left-0 top-full z-50 w-72 pt-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                  <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-modal">
                    <Link
                      href={listingActionHref("RENT")}
                      className="block rounded-xl px-4 py-3 transition-colors hover:bg-[#c69542]/15"
                    >
                      <div className="text-sm font-semibold text-gray-900">
                        Rent Out your property
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        Earn monthly income from your property
                      </div>
                    </Link>
                    <Link
                      href={listingActionHref("BUY")}
                      className="block rounded-xl px-4 py-3 transition-colors hover:bg-[#c69542]/15"
                    >
                      <div className="text-sm font-semibold text-gray-900">
                        Sell property
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        List your property for sale
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {navLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${linkCls(isActive(link.href))}`}
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${linkCls(isActive("/dashboard"))}`}
              >
                Dashboard
              </Link>
            )}
            {session && !isAdmin && (
              <Link
                href="/request-property"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${linkCls(isActive("/request-property"))}`}
              >
                <Search size={14} /> Request a Property
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${linkCls(isActive("/admin"))}`}
              >
                <Shield size={14} /> Admin
              </Link>
            )}
          </div>

          {/* Right: user or auth buttons */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-white hover:bg-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (session.user?.name?.[0] || "U").toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[90px] truncate">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-gray-100 py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {session.user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                          <Shield size={9} /> Admin
                        </span>
                      )}
                    </div>
                    {/* Links */}
                    {[
                      {
                        href: "/dashboard",
                        icon: LayoutDashboard,
                        label: "Dashboard",
                      },
                      {
                        href: "/dashboard/profile",
                        icon: User,
                        label: "My Profile",
                      },
                      {
                        href: "/dashboard/bookings",
                        icon: BookOpen,
                        label: "My Bookings",
                      },
                      {
                        href: "/dashboard/property-requests",
                        icon: Search,
                        label: "My Property Requests",
                      },
                      {
                        href: "/request-property",
                        icon: Building2,
                        label: "Request a Property",
                      },
                      {
                        href: "/dashboard/payments",
                        icon: CreditCard,
                        label: "Payments",
                      },
                    ]
                      .filter(
                        (item) =>
                          !isAdmin ||
                          ![
                            "/dashboard/property-requests",
                            "/request-property",
                          ].includes(item.href),
                      )
                      .map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <item.icon
                            size={15}
                            className="text-blue-500 shrink-0"
                          />{" "}
                          {item.label}
                        </Link>
                      ))}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield
                          size={15}
                          className="text-purple-500 shrink-0"
                        />{" "}
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: "/" });
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium transition-all text-white/80 hover:text-white hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg transition-colors text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#141311]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 space-y-1">
            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.href) ? "bg-blue-500/90 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
              >
                <link.icon size={16} /> {link.label}
              </Link>
            ))}
            {!isAdmin && (
              <Link
                href="/list-property"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/list-property") ? "bg-blue-500/90 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
              >
                <Building2 size={16} /> List your property
              </Link>
            )}
            {session && (
              <>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <p className="px-4 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Account
                  </p>
                </div>
                {[
                  {
                    href: "/dashboard",
                    icon: LayoutDashboard,
                    label: "Dashboard",
                  },
                  {
                    href: "/dashboard/bookings",
                    icon: BookOpen,
                    label: "My Bookings",
                  },
                  {
                    href: "/dashboard/property-requests",
                    icon: Search,
                    label: "My Property Requests",
                  },
                  {
                    href: "/request-property",
                    icon: Building2,
                    label: "Request a Property",
                  },
                  {
                    href: "/dashboard/payments",
                    icon: CreditCard,
                    label: "Payments",
                  },
                  { href: "/dashboard/profile", icon: User, label: "Profile" },
                ]
                  .filter(
                    (item) =>
                      !isAdmin ||
                      ![
                        "/dashboard/property-requests",
                        "/request-property",
                      ].includes(item.href),
                  )
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(item.href) ? "bg-blue-500/90 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                    >
                      <item.icon size={16} /> {item.label}
                    </Link>
                  ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive("/admin") ? "bg-purple-500/80 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}
              </>
            )}

            {/* Auth buttons */}
            {!session ? (
              <div className="flex gap-2 pt-3 border-t border-white/10 mt-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-3 text-sm font-medium border border-white/20 rounded-xl text-white/85 hover:bg-white/10 hover:-translate-y-0.5 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 transition-all border-t border-white/10 mt-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
