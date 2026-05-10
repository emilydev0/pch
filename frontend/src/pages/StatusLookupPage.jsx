import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiArrowRight,
  HiCheckCircle,
  HiDuplicate,
  HiLocationMarker,
  HiRefresh,
  HiSearch,
  HiShieldCheck,
  HiTruck,
} from "react-icons/hi";
import { apiFetch } from "../api";

function normalizeCode(value) {
  return value.trim().toUpperCase();
}

export default function StatusLookupPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState("");

  async function lookup(e) {
    e.preventDefault();
    const cleanCode = normalizeCode(code);
    if (!cleanCode) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await apiFetch(`/api/reward-entries/lookup/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to find that code.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openStatus() {
    if (result?.entry?._id) navigate(`/reward-status/${result.entry._id}`);
  }

  function openDelivery() {
    if (result?.entry?.deliveryCode) {
      navigate(`/delivery?code=${encodeURIComponent(result.entry.deliveryCode)}`);
    } else if (result?.entry?._id) {
      navigate(`/delivery/${result.entry._id}`);
    }
  }

  function copyCode(text, key) {
    if (!text || text === "Pending") return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  return (
    <div className="min-h-[70vh] bg-[#fffaf2] px-4 py-14">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-orange-950/5">
        <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-7 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20">
              <HiSearch className="h-7 w-7 text-orange-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">No login needed</p>
              <h1 className="font-display text-3xl font-extrabold">Check Status</h1>
            </div>
          </div>
        </div>

        <div className="p-7">
          <form onSubmit={lookup} className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-orange-700">
              Enter status code or delivery code
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. PCH-A1B2C3 or FDX-A1B2C3"
                className="min-w-0 flex-1 rounded-xl border border-orange-200 bg-white px-4 py-3 font-mono text-sm font-bold uppercase outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
              >
                {loading ? <HiRefresh className="h-4 w-4 animate-spin" /> : <HiSearch className="h-4 w-4" />}
                Find
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-orange-900">
              Use your draw status code to reopen your reward status. Winners can also use their delivery code to open delivery tracking.
            </p>
          </form>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {result?.entry && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <HiCheckCircle className="h-5 w-5" />
                  <p className="text-sm font-extrabold">Record found</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Matched by {result.matched === "delivery" ? "delivery code" : "status code"}.
                </p>
              </div>

              <div className="grid gap-4 p-5 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</p>
                  <p className="mt-1 font-semibold text-slate-900">{result.entry.fullName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Reward Pack</p>
                  <p className="mt-1 font-semibold text-slate-900">{result.entry.selectedRewardPack}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Draw Status</p>
                    <p className="mt-1 font-bold text-slate-900">{result.entry.status}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Status Code</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Copy this code to check status later.</p>
                    <button
                      type="button"
                      onClick={() => copyCode(result.entry.statusCode, "lookup-status-code")}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                    >
                      {copied === "lookup-status-code" ? <HiCheckCircle className="h-4 w-4 text-emerald-500" /> : <HiDuplicate className="h-4 w-4 text-blue-600" />}
                      {copied === "lookup-status-code" ? "Copied" : result.entry.statusCode || "Pending"}
                    </button>
                  </div>
                </div>
                {result.entry.deliveryCode && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Delivery Code</p>
                    <p className="mt-1 text-xs font-semibold text-orange-900">Copy this code to check delivery status later.</p>
                    <button
                      type="button"
                      onClick={() => copyCode(result.entry.deliveryCode, "lookup-delivery-code")}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-1.5 font-mono text-sm font-bold text-slate-900 transition hover:bg-orange-100"
                    >
                      {copied === "lookup-delivery-code" ? <HiCheckCircle className="h-4 w-4 text-emerald-500" /> : <HiDuplicate className="h-4 w-4 text-orange-600" />}
                      {copied === "lookup-delivery-code" ? "Copied" : result.entry.deliveryCode}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-3 border-t border-slate-100 p-5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openStatus}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <HiShieldCheck className="h-4 w-4" />
                  Open Draw Status
                  <HiArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={openDelivery}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                >
                  {result.entry.deliveryCode ? <HiTruck className="h-4 w-4" /> : <HiLocationMarker className="h-4 w-4" />}
                  Open Delivery
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-bold text-slate-500 transition hover:text-orange-700">
              Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
