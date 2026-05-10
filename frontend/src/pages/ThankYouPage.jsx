import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HiCheckCircle, HiClock, HiMail, HiShieldCheck, HiTruck } from "react-icons/hi";
import { apiFetch } from "../api";
import { config } from "../config";

const statusCopy = {
  "Pending Review": {
    icon: HiClock,
    title: "Your claim is pending review",
    text: "Our verification team has received your information and will review your prize reference, delivery details, and fulfillment preference.",
    tone: "bg-amber-50 text-amber-900 border-amber-200",
  },
  Seen: {
    icon: HiCheckCircle,
    title: "Your claim has been seen",
    text: "A review specialist has opened your request. Continue watching your official email for any delivery or document updates.",
    tone: "bg-blue-50 text-blue-900 border-blue-200",
  },
  "Delivery Ready": {
    icon: HiTruck,
    title: "Delivery coordination is ready",
    text: `Please contact our official support team at ${config.supportEmail} for the next delivery coordination step with an approved agent.`,
    tone: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  Completed: {
    icon: HiShieldCheck,
    title: "Claim completed",
    text: "Your claim has been marked completed by the review team.",
    tone: "bg-slate-100 text-slate-800 border-slate-200",
  },
};

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;

    apiFetch(`/api/claims/status/${encodeURIComponent(token)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setClaim(data.claim);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const details = statusCopy[claim?.status] || statusCopy["Pending Review"];
  const StatusIcon = details.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-8 py-7 text-white">
          <HiCheckCircle className="mb-4 h-12 w-12" />
          <h1 className="font-display text-3xl font-extrabold">Thank You</h1>
          <p className="mt-2 text-orange-50">Your information has been received securely.</p>
        </div>

        <div className="p-8">
          <p className="font-medium leading-7 text-slate-700">
            Our team will review your claim and contact you at the email address you provided. This process typically takes 3-5 business days.
          </p>

          <div className={`mt-6 rounded-2xl border p-5 ${details.tone}`}>
            <div className="flex gap-3">
              <StatusIcon className="mt-0.5 h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-display font-bold">{loading ? "Checking claim status..." : details.title}</p>
                <p className="mt-1 text-sm leading-6">{loading ? "Please wait while we load the latest review state." : details.text}</p>
                {claim?.selectedPrizePackage && (
                  <p className="mt-3 text-sm font-semibold">Selected package: {claim.selectedPrizePackage}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <div className="flex gap-3">
              <HiShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-700" />
              <div>
                <p className="font-display font-bold text-amber-950">Stay safe</p>
                <p className="mt-1 text-sm leading-6 text-amber-900">
                  Do not respond to anyone asking for OTP codes, banking passwords, card PINs, or any other fees. Our team will never request these.
                </p>
              </div>
            </div>
          </div>

          {/* <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
            <div className="flex gap-3">
              <HiMail className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p>
                For questions, contact{" "}
                <a href={`mailto:${config.supportEmail}`} className="font-semibold underline">{config.supportEmail}</a>.
                Only trust emails from <strong>{config.officialDomain}</strong>.
              </p>
            </div>
          </div> */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/help" className="inline-flex flex-1 items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700">
              Help & FAQ
            </Link>
            <Link to="/report" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-red-300 text-sm font-bold text-red-700 transition hover:bg-red-50">
              Report Suspicious Activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
