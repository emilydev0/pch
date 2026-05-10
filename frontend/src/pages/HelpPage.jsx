import { useState } from "react";
import { Link } from "react-router-dom";
import { config } from "../config";

const FAQS = [
  {
    q: "How do I know if my claim link is genuine?",
    a: `Genuine claim links are sent directly to winners by email from ${config.officialDomain}. The link will contain your unique token. Keep that token private and do not forward the link. If you are unsure, contact our support team before clicking any link.`,
  },
  {
    q: "Will I need to pay anything to claim my prize?",
    a: "No. Claiming your prize is completely free. We will never ask you for OTP codes, or banking credentials at any point. If anyone asks for these, it is a scam.",
  },
  {
    q: "How long does it take to receive my prize?",
    a: "Once your claim is reviewed and verified by our team, delivery is typically arranged within 5–10 business days. You will be contacted by email with a tracking reference.",
  },
  {
    q: "Who will deliver my prize?",
    a: "Delivery may be handled by FedEx or another approved courier, depending on availability in your area. You will receive delivery details by email from our official address.",
  },
  {
    q: "What if my claim link has expired?",
    a: `If your claim link has expired, please contact us at ${config.supportEmail} with your prize reference number and the email address you received the notification to.`,
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. We only collect information necessary to process your prize delivery. We do not sell your data or use it for marketing. See our Privacy Policy for full details.",
  },
  {
    q: "I received a call asking for my bank details. Is this from you?",
    a: "No. We will never call or email you asking for bank passwords, card numbers, PINs, or OTPs. Please report this immediately using our Report Center.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setSendError("Please fill in all fields."); return; }
    setSending(true);
    setSendError("");
    // In a real app, wire this to an email / ticketing API
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-blue-900 mb-1">Help &amp; Contact</h1>
      <p className="text-gray-500 mb-8">Find answers to common questions, or get in touch with our support team.</p>

      {/* Trust warning */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-8 flex gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-amber-800 text-sm">
          {/* <strong>Important:</strong> Only trust emails from <strong>{config.officialDomain}</strong>. */}
          We will never ask for payment, PINs, passwords, or for you to disclose your claim token. If you receive a suspicious message, please{" "}
          <Link to="/report" className="underline font-medium">report it here</Link>.
        </p>
      </div>

      {/* Contact details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📧</span> Official Contact
        </h2>
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <span className="text-blue-700 font-medium text-sm">Support Email:</span>
          <a href={`mailto:${config.supportEmail}`} className="text-blue-700 hover:underline font-semibold text-sm">
            {config.supportEmail}
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Response time is typically 1–2 business days. Please include your prize reference number in any enquiry.
        </p>
      </div>

      {/* Delivery questions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>📦</span> Delivery Questions
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Prize delivery may be handled by FedEx or another approved courier, depending on availability.
          Once your claim is processed, you will receive a delivery confirmation email with a tracking reference.
        </p>
        <p className="text-sm text-gray-600">
          For delivery questions, contact{" "}
          <a href={`mailto:${config.supportEmail}`} className="text-blue-600 hover:underline">{config.supportEmail}</a>.
          Please only use email addresses listed on this website.
        </p>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>💬</span> Frequently Asked Questions
        </h2>
        <div className="divide-y divide-gray-100">
          {FAQS.map((item, i) => (
            <div key={i} className="py-3">
              <button
                className="w-full text-left flex justify-between items-start gap-3 group"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors">{item.q}</span>
                <span className="text-gray-400 flex-shrink-0 mt-0.5 text-xs">{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>✉️</span> Send Us a Message
        </h2>
        {sent ? (
          <div className="bg-green-50 border border-green-300 text-green-800 rounded-xl p-4 text-sm">
            ✅ Your message has been sent. We will reply to your email within 1–2 business days.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Your Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} type="text"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                <input name="email" value={form.email} onChange={handleChange} type="email"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={4}
                placeholder="Please include your prize reference number if applicable…"
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y" />
            </div>
            {sendError && <p className="text-red-500 text-xs">{sendError}</p>}
            <button type="submit" disabled={sending}
              className="px-6 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60 transition-colors flex items-center gap-2">
              {sending ? (<><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>) : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
