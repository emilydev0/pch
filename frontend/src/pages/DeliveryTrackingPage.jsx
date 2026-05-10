import { useEffect, useState, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  HiRefresh, HiExclamation, HiCheckCircle, HiClock, HiDuplicate,
  HiTruck, HiLocationMarker, HiHome, HiOfficeBuilding,
  HiShieldCheck, HiArrowLeft, HiMail,
} from "react-icons/hi";
import { apiFetch } from "../api";
import { config } from "../config";

// ── Animated road / tracker visual ────────────────────────────────────────────
function DeliveryVisual({ progress = 0, currentCheckpoint = "Processing", issues = [] }) {
  const hasIssues = issues.length > 0;

  const checkpoints = [
    { label: "Processing", pct: 0, icon: HiOfficeBuilding },
    { label: "Out for delivery", pct: 60, icon: HiTruck },
    { label: "Delivered", pct: 100, icon: HiHome },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl">
      {/* Background grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,#fff 39px,#fff 40px), repeating-linear-gradient(90deg,transparent,transparent 39px,#fff 39px,#fff 40px)",
        }}
      />

      <div className="relative">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-orange-300">Live Delivery Tracking</p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-2xl font-extrabold text-white">{currentCheckpoint}</p>
          {hasIssues && (
            <span className="rounded-full border border-red-400/60 bg-red-500/20 px-2.5 py-1 text-xs font-extrabold text-red-100">
              Delivery fault
            </span>
          )}
        </div>

        {/* Road track */}
        <div className="relative mt-8 mb-4">
          {/* Road background */}
          <div className="relative mx-auto h-12 w-full max-w-[520px] overflow-hidden rounded-full bg-slate-700/60 shadow-inner">
            {/* Road dashes */}
            <div
              className="absolute inset-y-[45%] left-0 right-0 h-[10%]"
              style={{
                backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 16px, rgba(255,255,255,0.15) 16px, rgba(255,255,255,0.15) 28px)",
              }}
            />
            {/* Progress fill */}
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(progress, 4)}%`,
                background: hasIssues
                  ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                  : "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)",
                boxShadow: hasIssues
                  ? "0 0 24px rgba(239,68,68,0.6)"
                  : "0 0 24px rgba(251,146,60,0.7)",
              }}
            />

            {/* Truck icon moving along the road */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
              style={{ left: `${Math.max(progress, 4)}%` }}
            >
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-xl ${
                  hasIssues
                    ? "border-red-400 bg-red-600"
                    : "border-orange-300 bg-orange-500"
                }`}
              >
                <HiTruck className="h-5 w-5 text-white" />
                {hasIssues && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-red-600 text-[11px] font-black leading-none text-white">
                    !
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Percentage label */}
          <div className="mt-2 text-center">
            <span className="text-sm font-bold text-white/70">{progress}% complete</span>
          </div>
        </div>

        {/* Checkpoints */}
        <div className="mt-6 grid grid-cols-3 gap-1">
          {checkpoints.map((cp) => {
            const reached = progress >= cp.pct;
            const Icon = cp.icon;
            return (
              <div key={cp.label} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ${
                    reached
                      ? "border-orange-400 bg-orange-500/80 shadow-lg shadow-orange-500/30"
                      : "border-slate-600 bg-slate-700/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${reached ? "text-white" : "text-slate-500"}`} />
                </div>
                <p className={`text-center text-[10px] font-semibold leading-tight ${reached ? "text-orange-200" : "text-slate-500"}`}>
                  {cp.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Issues panel ───────────────────────────────────────────────────────────────
function IssuesList({ issues }) {
  if (!issues || issues.length === 0) return null;

  return (
    <div className="mt-5 space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-red-600">Active Delivery Issues</p>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
            <HiExclamation className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-red-950">Delivery needs attention</p>
            <p className="mt-1 text-xs leading-5 text-red-800">
              Please contact our delivery agent so they can help get the delivery working again.
            </p>
            <a
              href={`mailto:${config.fedexAgentEmail}`}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
            >
              <HiMail className="h-3.5 w-3.5" />
              {config.fedexAgentEmail}
            </a>
          </div>
        </div>
      </div>
      {issues.map((issue, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm"
        >
          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <HiExclamation className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">{issue.message}</p>
            {/* {issue.expiresAt && (
              <p className="mt-1 text-xs text-red-600">
                Auto-clears: {new Date(issue.expiresAt).toLocaleString()}
              </p>
            )} */}
            <p className="mt-1 text-xs text-red-400">
              Reported: {new Date(issue.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Address card ───────────────────────────────────────────────────────────────
function AddressCard({ label, address, icon: Icon, color }) {
  if (!address) return null;
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/60">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
          <p className="mt-1 text-sm font-semibold leading-5">{address}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DeliveryTrackingPage() {
  const { entryId } = useParams();
  const [searchParams] = useSearchParams();
  const deliveryCode = searchParams.get("code");

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputCode, setInputCode] = useState(deliveryCode || "");
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState("");

  async function loadByEntryId(id) {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/reward-entries/status/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load delivery info.");
      setEntry(data.entry);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadByCode(code) {
    setSearching(true);
    setError("");
    try {
      const res = await apiFetch(`/api/reward-entries/delivery/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delivery code not found.");
      setEntry(data.entry);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (entryId) {
      loadByEntryId(entryId);
    } else if (deliveryCode) {
      loadByCode(deliveryCode);
    } else {
      setLoading(false);
    }
  }, [entryId, deliveryCode]);

  const delivery = entry?.delivery || {};
  const issues = (delivery.issues || []).filter(
    (i) => !i.resolved && (!i.expiresAt || new Date(i.expiresAt) > new Date())
  );
  const hasIssues = issues.length > 0;
  const estimatedDelivery = delivery.estimatedDelivery || "Arrives in 2 to 4 days";

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to={entryId ? `/reward-status/${entryId}` : "/"}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-700 transition"
        >
          <HiArrowLeft className="h-4 w-4" />
          {entryId ? "Back to status" : "Back home"}
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-orange-950/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-7 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20">
                <HiTruck className="h-7 w-7 text-orange-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">Prize Delivery</p>
                <h1 className="mt-0.5 font-display text-2xl font-extrabold">Delivery Tracker</h1>
              </div>
            </div>
          </div>

          <div className="p-7">
            {/* Code lookup form (when no entryId provided) */}
            {!entryId && !entry && (
              <div className="mb-7">
                <p className="mb-3 text-sm font-bold text-slate-700">Enter your delivery code to track your prize</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FDX-A3F9C2"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                    onKeyDown={(e) => e.key === "Enter" && inputCode.trim() && loadByCode(inputCode)}
                  />
                  <button
                    onClick={() => inputCode.trim() && loadByCode(inputCode)}
                    disabled={searching || !inputCode.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
                  >
                    {searching ? (
                      <HiRefresh className="h-4 w-4 animate-spin" />
                    ) : (
                      <HiLocationMarker className="h-4 w-4" />
                    )}
                    Track
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-3 py-8 text-slate-500">
                <HiRefresh className="h-5 w-5 animate-spin" />
                <p className="text-sm font-semibold">Loading delivery info...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : entry ? (
              <>
                {/* Delivery code badge */}
                {entry.deliveryCode && (
                  <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100">
                      <HiShieldCheck className="h-5 w-5 text-orange-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Delivery Code</p>
                      <p className="text-xs font-semibold text-orange-900">Copy this code to check delivery status later.</p>
                    </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(entry.deliveryCode, "delivery-code")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 font-mono text-lg font-extrabold text-slate-950 transition hover:bg-orange-100"
                    >
                      {copied === "delivery-code" ? <HiCheckCircle className="h-5 w-5 text-emerald-500" /> : <HiDuplicate className="h-5 w-5 text-orange-600" />}
                      {copied === "delivery-code" ? "Copied" : entry.deliveryCode}
                    </button>
                  </div>
                )}

                {/* Prize summary */}
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-bold text-slate-800">{entry.selectedRewardPack}</p>
                  <p className="mt-1 text-slate-600">
                    {entry.prizeAmountWon
                      ? `Prize: ${entry.prizeAmountWon}`
                      : `Listed: ${entry.listedPrice || "—"}`}
                    {entry.fulfillmentPreference && ` · via ${entry.fulfillmentPreference}`}
                  </p>
                  <p className="mt-1 text-slate-500">Recipient: {entry.fullName}</p>
                </div>

                {/* VISUAL TRACKER */}
                <DeliveryVisual
                  progress={delivery.progressPercent || 0}
                  currentCheckpoint={delivery.currentCheckpoint || "Processing"}
                  issues={issues}
                />

                {/* Carrier & tracking number */}
                {(delivery.carrier || delivery.trackingNumber) && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {delivery.carrier && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Carrier</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{delivery.carrier}</p>
                      </div>
                    )}
                    {delivery.trackingNumber && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tracking #</p>
                        <p className="mt-1 font-mono text-sm font-semibold text-slate-800">{delivery.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Estimated delivery */}
                {(delivery.estimatedDelivery || entry.deliveryCode) && (
                  <div className={`mt-4 flex items-center gap-3 rounded-2xl border px-5 py-4 ${hasIssues ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
                    <HiClock className={`h-5 w-5 flex-shrink-0 ${hasIssues ? "text-red-600" : "text-emerald-600"}`} />
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest ${hasIssues ? "text-red-700" : "text-emerald-700"}`}>Estimated Time to Arrive</p>
                      <p className={`mt-0.5 text-sm font-semibold ${hasIssues ? "text-red-900" : "text-emerald-900"}`}>{estimatedDelivery}</p>
                    </div>
                  </div>
                )}

                {/* Addresses */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <AddressCard
                    label="Pickup / Origin"
                    address={delivery.pickupAddress}
                    icon={HiOfficeBuilding}
                    color="border-slate-200 bg-slate-50 text-slate-800"
                  />
                  <AddressCard
                    label="Delivery Address"
                    address={delivery.deliveryAddress}
                    icon={HiHome}
                    color="border-orange-200 bg-orange-50 text-orange-900"
                  />
                </div>

                {/* Issues */}
                <IssuesList issues={issues} />

                {/* No delivery info yet */}
                {!delivery.pickupAddress && !delivery.deliveryAddress && !delivery.progressPercent && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                    Delivery details are being set up by the dispatch team. Please check back soon.
                  </div>
                )}

                {/* Security and support note */}
                <div className="mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
                  <div className="flex gap-3 p-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                      <HiShieldCheck className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-950">Keep your delivery code private</p>
                      <p className="mt-1 text-xs leading-5 text-amber-900">
                        Official delivery coordination is handled exclusively through the platform. Do not share your delivery code publicly.
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-amber-200/80 bg-white/55 px-4 py-3">
                    <a
                      href={`mailto:${config.fedexAgentEmail}`}
                      className="flex flex-col items-stretch gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/70 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                          <HiMail className="h-4 w-4 text-orange-700" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold uppercase tracking-widest text-orange-700">Need help?</span>
                          <span className="block text-sm font-semibold text-slate-800">
                            Contact our agent if you encounter any issue.
                          </span>
                        </span>
                      </span>
                      <span className="block min-w-0 max-w-full break-all rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-center text-xs font-bold text-orange-700 sm:flex-shrink-0 sm:break-normal">
                        {config.fedexAgentEmail}
                      </span>
                    </a>
                  </div>
                </div>

                {/* Refresh */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() =>
                      entryId ? loadByEntryId(entryId) : entry?.deliveryCode && loadByCode(entry.deliveryCode)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                  >
                    <HiRefresh className="h-4 w-4" />
                    Refresh
                  </button>
                  {entryId && (
                    <Link
                      to={`/reward-status/${entryId}`}
                      className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Full Status
                    </Link>
                  )}
                </div>
              </>
            ) : (
              !loading && !error && !entryId && (
                <div className="py-8 text-center text-slate-500">
                  <HiTruck className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold">Enter your delivery code above to get started.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
