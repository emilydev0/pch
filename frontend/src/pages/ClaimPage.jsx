import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { apiFetch } from "../api";
import { config } from "../config";
import {
  HiCheckCircle,
  HiClock,
  HiExclamation,
  HiInformationCircle,
  HiLockClosed,
  HiShieldCheck,
  HiSparkles,
  HiTruck,
} from "react-icons/hi";

const INCOME_OPTIONS = [
  "", "Prefer not to say", "Under $20,000", "$20,000 - $40,000",
  "$40,000 - $60,000", "$60,000 - $80,000", "$80,000 - $100,000", "Over $100,000",
];

const DELIVERY_OPTIONS = [
  "", "Morning (8am - 12pm)", "Afternoon (12pm - 5pm)",
  "Evening (5pm - 8pm)", "Any time", "Weekdays only", "Weekends only",
];

const PRIZE_DELIVERY_METHOD_OPTIONS = ["", "Cash", "Cheque"];

const INITIAL = {
  fullName: "", email: "", phone: "", address: "", city: "",
  state: "", country: "", postalCode: "", prizeReference: "",
  monthlyIncomeRange: "", prizeDeliveryMethod: "", preferredDeliveryTime: "",
  wantsAnonymous: false, confirmAccurate: false, confirmNoFee: false,
};

export default function ClaimPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const selectedPrizePackageFromUrl = new URLSearchParams(search).get("package") || "";

  const [tokenStatus, setTokenStatus] = useState("loading");
  const [tokenError, setTokenError] = useState("");
  const [form, setForm] = useState(INITIAL);
  const [rewardEntryId, setRewardEntryId] = useState("");
  const [prefilledPackage, setPrefilledPackage] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!token) { setTokenStatus("invalid"); setTokenError("No claim token found in the URL."); return; }
    apiFetch(`/api/claims/validate/${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          if (data.prefill) {
            setForm((prev) => ({
              ...prev,
              fullName: data.prefill.fullName || prev.fullName,
              email: data.prefill.email || prev.email,
              phone: data.prefill.phone || prev.phone,
              monthlyIncomeRange: data.prefill.monthlyIncomeRange || prev.monthlyIncomeRange,
              address: data.prefill.address || prev.address,
              state: data.prefill.state || prev.state,
              prizeDeliveryMethod: data.prefill.prizeDeliveryMethod || prev.prizeDeliveryMethod,
            }));
            setPrefilledPackage(data.prefill.selectedPrizePackage || "");
          }
          if (data.rewardEntryId) setRewardEntryId(data.rewardEntryId);
          setTokenStatus("valid");
        }
        else { setTokenStatus("invalid"); setTokenError(data.reason || "This claim link is not valid."); }
      })
      .catch(() => { setTokenStatus("invalid"); setTokenError("Unable to verify claim link. Please try again or contact support."); });
  }, [token]);

  const selectedPrizePackage = prefilledPackage || selectedPrizePackageFromUrl;
  const hasLockedPrefill = Boolean(rewardEntryId);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email address.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    if (!form.address.trim()) errs.address = "Delivery address is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (!form.state.trim()) errs.state = "State / Province is required.";
    if (!form.country.trim()) errs.country = "Country is required.";
    if (!form.postalCode.trim()) errs.postalCode = "Postal code is required.";
    if (!form.prizeReference.trim()) errs.prizeReference = "Prize reference number is required.";
    if (!form.prizeDeliveryMethod) errs.prizeDeliveryMethod = "Please select cash or cheque.";
    if (!form.preferredDeliveryTime) errs.preferredDeliveryTime = "Please select a preferred delivery time.";
    if (!form.confirmAccurate) errs.confirmAccurate = "You must confirm the information is accurate.";
    if (!form.confirmNoFee) errs.confirmNoFee = "You must confirm you understand no fee is required.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
          prizeReference: form.prizeReference,
          selectedPrizePackage,
          monthlyIncomeRange: form.monthlyIncomeRange,
          prizeDeliveryMethod: form.prizeDeliveryMethod,
          preferredDeliveryTime: form.preferredDeliveryTime,
          wantsAnonymous: form.wantsAnonymous,
          rewardEntryId,
          claimToken: token,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) { navigate(`/thank-you?token=${encodeURIComponent(token)}`); }
      else { setServerError(data.error || "Submission failed. Please try again."); }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (tokenStatus === "loading") {
    return (
      <div className="min-h-[62vh] flex items-center justify-center px-4">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white px-8 py-9 text-center shadow-xl shadow-blue-900/5">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100 blur-2xl" />
          <div className="relative">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
            </div>
            <p className="font-display text-xl font-bold text-slate-900">Verifying your secure link</p>
            <p className="mt-2 text-sm text-slate-500">This only takes a moment.</p>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-800">
              Keep your claim token and secure link private. Do not forward them to anyone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <HiLockClosed className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Claim link issue</h1>
          <p className="mt-3 text-slate-600">{tokenError}</p>
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            For your safety, do not share claim tokens or secure claim links. Contact official support if you are unsure.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            If you believe this is an error, contact{" "}
            <a href={`mailto:${config.supportEmail}`} className="font-medium text-blue-700 hover:underline">{config.supportEmail}</a>.
          </p>
          <Link to="/help" className="mt-7 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
            Go to Help Centre
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(255,166,52,0.22),_transparent_34%),linear-gradient(135deg,_#f8fafc_0%,_#eef6ff_46%,_#fff7ed_100%)]" />
      <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="mb-7 overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-2xl shadow-blue-950/10">
          <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative p-7 sm:p-10">
              <div className="absolute -left-14 -top-14 h-40 w-40 rounded-full bg-[#FFA634]/25 blur-3xl" />
              <div className="relative">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-amber-100">
                  <HiSparkles className="h-4 w-4 text-[#FFA634]" />
                  Secure verification link
                </div>
                <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                  Your secure review link is active.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Complete the form below so our team can review your details, selected reward option, and delivery preferences.
                </p>
                <p className="mt-4 max-w-2xl rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm font-semibold leading-6 text-amber-100">
                  Do not disclose this claim token or forward this secure link. Anyone with the token may be able to open this verification page.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.06] p-7 backdrop-blur lg:border-l lg:border-t-0">
              <div className="grid gap-3">
                <TrustItem icon={HiShieldCheck} title="Beware of Scams" text="We never request OTPs, PINs, or banking passwords." />
                <TrustItem icon={HiClock} title="Fast review" text="Your submission goes straight to the verification team for processing." />
                <TrustItem icon={HiTruck} title="Delivery review" text="Delivery preferences are reviewed before any approved fulfillment step." />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <InfoCard
              tone="amber"
              icon={HiExclamation}
              title="Security notice"
              text={
                <>
                  We will <strong>never</strong> ask you for your bank password, OTP, card PIN. If anyone asks for these,{" "}
                  <Link to="/report" className="font-semibold underline">report it immediately</Link>. Never disclose your claim token or forward your secure claim link.
                </>
              }
            />
            <InfoCard
              tone="blue"
              icon={HiInformationCircle}
              title="Before you submit"
              text="Use the same name and reference from your notice so the review team can match your submission quickly."
            />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Official support</p>
              <a href={`mailto:${config.supportEmail}`} className="mt-2 block break-words text-sm font-semibold text-blue-700 hover:underline">
                {config.supportEmail}
              </a>
              <p className="mt-2 text-sm leading-6 text-slate-500">Only use contact details listed on this website.</p>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/60 px-6 py-5 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Secure claim form</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">Delivery and verification details</h2>
              <p className="mt-1 text-sm text-slate-500">Required fields are marked with an asterisk.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8">
              <SectionHeader kicker="Step 1" title="Personal information" />

              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name" required name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="As it appears on your ID" disabled={hasLockedPrefill} />
                <Field label="Email Address" required name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" disabled={hasLockedPrefill} />
                <Field label="Phone Number" required name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="+1 555 000 0000" disabled={hasLockedPrefill} />
                <SelectField label="Monthly Income Range" name="monthlyIncomeRange" value={form.monthlyIncomeRange} onChange={handleChange} options={INCOME_OPTIONS} optional disabled={hasLockedPrefill} />
              </div>

              {hasLockedPrefill && (
                <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                  Your name, email, phone number, and monthly income range were carried over from the original request and cannot be changed on this verification form.
                </div>
              )}

              <SectionHeader kicker="Step 2" title="Delivery address" />

              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Street Address" required name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="House number and street name" />
                </div>
                <Field label="City" required name="city" value={form.city} onChange={handleChange} error={errors.city} />
                <Field label="State / Province" required name="state" value={form.state} onChange={handleChange} error={errors.state} />
                <Field label="Country" required name="country" value={form.country} onChange={handleChange} error={errors.country} />
                <Field label="Postal Code" required name="postalCode" value={form.postalCode} onChange={handleChange} error={errors.postalCode} />
              </div>

              <SectionHeader kicker="Step 3" title="Reward and delivery details" />

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Reference Number" required name="prizeReference" value={form.prizeReference} onChange={handleChange} error={errors.prizeReference} placeholder="Reference number" />
                <SelectField label="Preferred Fulfillment Method" required name="prizeDeliveryMethod" value={form.prizeDeliveryMethod} onChange={handleChange} options={PRIZE_DELIVERY_METHOD_OPTIONS} error={errors.prizeDeliveryMethod} />
                <SelectField label="Preferred Delivery Time" required name="preferredDeliveryTime" value={form.preferredDeliveryTime} onChange={handleChange} options={DELIVERY_OPTIONS} error={errors.preferredDeliveryTime} />
              </div>

              <div className="mb-6">
                <CheckboxField
                  name="wantsAnonymous"
                  checked={form.wantsAnonymous}
                  onChange={handleChange}
                  label="I would like my submission to remain anonymous where possible."
                />
                <p className={`mt-2 rounded-xl px-4 py-3 text-xs leading-5 ${form.wantsAnonymous ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-500"}`}>
                  {form.wantsAnonymous
                    ? "Your privacy preference will be sent with your submission for review by the verification team."
                    : "You can choose this if you prefer your name not be used in public-facing announcements where privacy rules allow."}
                </p>
              </div>

              <div className="mb-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <HiTruck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" />
                <p>
                  <strong>Delivery information:</strong> Any approved fulfillment may be coordinated by cash, cheque, FedEx, or another approved courier, depending on verification and availability.
                  For delivery questions, contact{" "}
                  <a href={`mailto:${config.supportEmail}`} className="font-semibold underline">{config.supportEmail}</a>.{" "}
                  Keep your claim token private when asking general delivery questions.
                </p>
              </div>

              <details className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 text-sm">
                <summary className="flex cursor-pointer select-none items-center gap-2 rounded-2xl px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-100">
                  <HiLockClosed className="h-4 w-4 text-slate-500" />
                  Why we collect this information
                </summary>
                <div className="space-y-2 px-4 pb-4 pt-1 text-slate-600">
                  <p>We collect your name, contact details, and address solely to:</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Verify the identity details connected to this submission</li>
                    <li>Review the selected reward option and delivery preferences</li>
                    <li>Contact you with updates about your submission</li>
                  </ul>
                  <p>We do <strong>not</strong> sell your data or use it for marketing. See our <Link to="/privacy" className="font-medium text-blue-700 underline">Privacy Policy</Link> for full details.</p>
                </div>
              </details>

              <div className="mb-7 space-y-3">
                <CheckboxField
                  name="confirmAccurate"
                  checked={form.confirmAccurate}
                  onChange={handleChange}
                  error={errors.confirmAccurate}
                  label="I confirm that the information provided is accurate and complete."
                />
                <CheckboxField
                  name="confirmNoFee"
                  checked={form.confirmNoFee}
                  onChange={handleChange}
                  error={errors.confirmNoFee}
                  label="I understand that submitting this form does not require me to pay any fee."
                />
              </div>

              {serverError && (
                <div className="mb-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <HiExclamation className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 py-4 font-display text-base font-bold text-white shadow-lg shadow-blue-700/25 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="h-5 w-5" />
                    Submit Claim
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                By submitting, you agree to our{" "}
                <Link to="/privacy" className="underline">Privacy Policy</Link> and{" "}
                <Link to="/terms" className="underline">Terms &amp; Conditions</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-[#FFA634]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function InfoCard({ tone, icon: Icon, title, text }) {
  const styles = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    blue: "border-blue-100 bg-blue-50 text-blue-900",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[tone] || styles.blue}`}>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-display font-bold">{title}</p>
      </div>
      <p className="text-sm leading-6">{text}</p>
    </div>
  );
}

function SectionHeader({ kicker, title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="rounded-full bg-[#FFA634]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-700">{kicker}</span>
      <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder, required, optional, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      <input
        id={name} name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, error, required, optional, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      <select
        id={name} name={name} value={value} onChange={onChange}
        disabled={disabled}
        className={`rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:-translate-y-0.5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
      >
        {options.map((o) => <option key={o} value={o}>{o || `Select ${label}`}</option>)}
      </select>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function CheckboxField({ name, checked, onChange, label, error }) {
  return (
    <div>
      <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${error ? "border-red-300 bg-red-50" : checked ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
        <input
          type="checkbox" name={name} checked={checked} onChange={onChange}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-700"
        />
        <span className="text-sm leading-6 text-slate-700">{label}</span>
      </label>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
