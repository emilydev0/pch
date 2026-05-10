import { useState } from "react";
import { apiFetch } from "../api";
import { config } from "../config";

const REPORT_TYPES = [
  { value: "fake_call", label: "📞 Fake Phone Call" },
  { value: "fake_email", label: "📧 Fake Email" },
  { value: "payment_request", label: "💳 Payment Request" },
  { value: "suspicious_link", label: "🔗 Suspicious Link" },
  { value: "impersonation", label: "👤 Impersonation Attempt" },
  { value: "other", label: "⚠️ Other Suspicious Activity" },
];

const INITIAL = { name: "", email: "", phone: "", reportType: "", description: "" };

export default function ReportPage() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email.";
    if (!form.reportType) errs.reportType = "Please select what you are reporting.";
    if (!form.description.trim()) errs.description = "Please describe what happened.";
    else if (form.description.length > 2000) errs.description = "Description must be under 2000 characters.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const fullDescription = form.reportType
        ? `[Type: ${REPORT_TYPES.find(r => r.value === form.reportType)?.label}]\n\n${form.description}`
        : form.description;
      const res = await apiFetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, description: fullDescription }),
      });
      const data = await res.json();
      if (res.ok && data.success) { setSubmitted(true); }
      else { setServerError(data.error || "Submission failed. Please try again."); }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="font-display text-2xl font-bold text-green-800 mb-3">Report Received</h1>
          <p className="text-gray-600 mb-2">Thank you for helping keep others safe.</p>
          <p className="text-gray-500 text-sm mb-6">
            Your report has been logged and will be reviewed by our security team. We may contact you at the email provided if we need more information.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 text-left">
            <strong>Reminder:</strong> If you have suffered financial loss or believe a crime has been committed,
            please also report it to your local authorities or national fraud reporting service.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-red-700 text-white rounded-t-2xl p-6 text-center">
        <div className="text-4xl mb-2">🚨</div>
        <h1 className="font-display text-2xl font-bold mb-1">Report Fraud or Suspicious Activity</h1>
        <p className="text-red-200 text-sm">
          Use this form to report fake calls, emails, payment demands, or any impersonation attempts.
        </p>
      </div>

      <div className="bg-white rounded-b-2xl border border-gray-200 border-t-0 shadow-md p-6 sm:p-8">
        {/* What we handle */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-7">
          {REPORT_TYPES.map((rt) => (
            <div key={rt.value} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-600 text-center">
              {rt.label}
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-7 flex gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p className="text-amber-800 text-sm">
            If you have suffered financial loss or believe a crime has been committed, please also contact your local police
            or national cybercrime / fraud reporting authority.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Contact Information</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
            <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
            <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} optional />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-1">Report Details</p>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">What are you reporting? <span className="text-red-500">*</span></label>
            <select name="reportType" value={form.reportType} onChange={handleChange}
              className={`px-3 py-2.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 ${errors.reportType ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
              <option value="">Select incident type…</option>
              {REPORT_TYPES.map((rt) => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
            </select>
            {errors.reportType && <p className="text-red-500 text-xs">{errors.reportType}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Describe what happened <span className="text-red-500">*</span>
            </label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5}
              placeholder="Please include as much detail as possible: dates, phone numbers, email addresses, website URLs, or anything else relevant…"
              className={`px-3 py-2.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-y ${errors.description ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            <p className="text-xs text-gray-400 text-right">{form.description.length}/2000</p>
          </div>

          {/* Screenshot placeholder */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">📎 Screenshot Upload</p>
            <p className="text-xs text-gray-400">Screenshot upload will be available in a future update. In the meantime, you can email screenshots to <a href={`mailto:${config.supportEmail}`} className="text-blue-600 underline">{config.supportEmail}</a>.</p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 text-sm">
              ❌ {serverError}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-3 px-6 bg-red-700 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {submitting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>) : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder, required, optional }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>}
      </label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`px-3 py-2.5 rounded-lg border text-sm bg-white outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 ${error ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
