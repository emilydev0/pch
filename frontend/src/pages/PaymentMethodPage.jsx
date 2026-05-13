import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiCreditCard,
  HiExclamation,
  HiRefresh,
} from "react-icons/hi";
import { apiFetch } from "../api";

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

export default function PaymentMethodPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!selected) {
      setError("Please choose the payment method you want to use.");
      return;
    }

    setSaving(true);
    try {
      let res = await apiFetch(`/api/reward-entries/${entryId}/payment-preference`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: selected }),
      });

      let data = await res.json();
      if (res.status === 404 && data.error === "Route not found.") {
        res = await apiFetch(`/api/admin/reward-entries/${entryId}/payment-method`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod: selected }),
        });
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || "Unable to save payment method.");
      navigate(`/reward-status/${entryId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[70vh] bg-[#fffaf2] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/reward-status/${entryId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-700"
        >
          <HiArrowLeft className="h-4 w-4" />
          Skip to status page
        </Link>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-orange-950/5">
          <div className="bg-slate-950 px-7 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-200">
                <HiCreditCard className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
                  Payment selection
                </p>
                <h1 className="mt-1 font-display text-3xl font-extrabold">
                  Choose your payment method
                </h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-7">
            <p className="text-sm leading-6 text-slate-600">
              Select the kind of payment you want. Your choice will appear in the admin dashboard, then the admin will assign the final payment details as usual.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selected === method;
                return (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                      isSelected
                        ? "border-orange-400 bg-orange-50 text-orange-950 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/40"
                    }`}
                  >
                    <span className="font-display text-base font-extrabold">{method}</span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <HiCheckCircle className="h-5 w-5" />}
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={isSelected}
                      onChange={(e) => setSelected(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <HiExclamation className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
                <p className="text-sm leading-6 text-amber-900">
                  Do not share OTP codes, banking passwords, card PINs, wallet seed phrases, or private keys. Only use details shown on your status page after admin assignment.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 font-display text-sm font-extrabold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <HiRefresh className="h-4 w-4 animate-spin" /> : <HiCheckCircle className="h-5 w-5" />}
              {saving ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
