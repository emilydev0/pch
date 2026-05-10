import { useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import {
  HiDocumentText,
  HiExclamationCircle,
  HiHome,
  HiMail,
  HiMenu,
  HiQuestionMarkCircle,
  HiSearch,
  HiShieldCheck,
  HiX,
} from "react-icons/hi";
import { config } from "../config";

const navItems = [
  { to: "/", label: "Home", icon: HiHome, end: true },
  { to: "/check-status", label: "Check Status", icon: HiSearch },
  { to: "/help", label: "Help", icon: HiQuestionMarkCircle },
  { to: "/report", label: "Report Fraud", icon: HiExclamationCircle, alert: true },
];

const footerLinks = [
  { to: "/check-status", label: "Check Status" },
  { to: "/help", label: "Help & Contact" },
  { to: "/report", label: "Report Fraud", alert: true },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
];

function navClass({ isActive }, alert = false) {
  if (alert) {
    return `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? "bg-red-50 text-red-700" : "text-red-600 hover:bg-red-50 hover:text-red-700"
    }`;
  }

  return `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={config.logoPath}
                alt={config.logoAlt}
                className="h-9 w-9 object-contain rounded-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-extrabold leading-tight text-slate-950 sm:text-lg">
                {config.companyName}
              </span>
              <span className="hidden text-xs font-semibold text-blue-700 sm:block">
                Secure claim portal
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map(({ to, label, icon: Icon, alert, end }) => (
              <NavLink key={to} to={to} end={end} className={(state) => navClass(state, alert)}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav id="mobile-navigation" className="grid gap-1 border-t border-slate-100 pb-4 pt-3 md:hidden" aria-label="Mobile navigation">
            {navItems.map(({ to, label, icon: Icon, alert, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={(state) => navClass(state, alert)}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                <img
                  src={config.logoPath}
                  alt={config.logoAlt}
                  className="h-9 w-9 object-contain rounded-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </span>
              <span className="font-display text-base font-extrabold text-white">
                {config.companyName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6">
              Official prize claim portal.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Quick Links</p>
            <ul className="grid gap-2 text-sm">
              {footerLinks.map(({ to, label, alert }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`inline-flex rounded-lg py-1 transition-colors ${
                      alert ? "text-red-300 hover:text-red-200" : "hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Official Support</p>
            <a href={`mailto:${config.supportEmail}`} className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-blue-200 transition hover:bg-white/10 hover:text-blue-100">
              <HiMail className="h-4 w-4 flex-shrink-0" />
              <span className="break-all">{config.supportEmail}</span>
            </a>
            <p className="mt-3 flex gap-2 text-xs leading-5">
              <HiShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
              <span>
                Only trust emails from <strong className="text-slate-200">{config.officialDomain}</strong>.
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {config.companyName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <HiDocumentText className="h-4 w-4" />
            <span>Delivery may be handled by</span>
            <img
              src="/images/fedex.png"
              alt="FedEx"
              className="h-5 opacity-70"
            />
            <span>or another approved courier.</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-600">All courier trademarks belong to their respective owners.</p>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
