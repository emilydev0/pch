import { Link } from "react-router-dom";
import {
  HiCheck,
  HiExclamation,
  HiGift,
  HiMail,
  HiShieldCheck,
  HiSparkles,
  HiTruck,
  HiStar,
  HiCash,
} from "react-icons/hi";
import { config } from "../config";
import { rewardPacks } from "../data/rewardPacks";

const timeline = [
  ["1", "Select a reward pack", "Choose the entry package that matches the reward option you want to review."],
  ["2", "Review the package", "Confirm the entries, price label, and official no-fee claim notice before continuing."],
  ["3", "Submit claim details", "Use the secure winner form to submit identity, delivery, and fulfillment preferences."],
  ["4", "Track review status", "The review team can mark your claim as seen, delivery ready, or completed."],
];

export default function HomePage() {
  return (
    <div className="bg-[#f4f2ee]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 lg:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-800">
            <HiSparkles className="h-4 w-4" />
            Official reward claim review
          </div>
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
            Choose your reward pack and continue to secure claim review.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Review available entry packs, select the one that matches your notice, and continue through the official claim process.
          </p>

          {/* Prize amount highlight */}
          <div className="mx-auto mt-7 max-w-xl overflow-hidden rounded-3xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg shadow-yellow-200/40">
            <div className="px-6 py-5">
              <div className="mb-2 flex items-center justify-center gap-2">
                <HiStar className="h-5 w-5 text-yellow-500" />
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-yellow-700">Grand Prize Draw</p>
                <HiStar className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="font-display text-5xl font-extrabold text-slate-950">$150,000</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Each entry pack gives you a <strong className="text-orange-700">chance to win up to $150,000</strong>.
                <br className="hidden sm:block" />
                Winners receive their prize by Cash or Cheque — delivered to their registered address.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-yellow-200 bg-white/70 px-4 py-2">
                <HiCash className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold text-slate-700">No purchase necessary to enter. Odds depend on total entries.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="claim-options" className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-start xl:gap-7">
          {rewardPacks.map((pack) => (
            <RewardCard key={pack.id} pack={pack} />
          ))}
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-700">How It Works</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-950">A clear path from reward selection to claim review.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Each option opens a dedicated review page before the claim form, so the selected pack is attached to the request.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {timeline.map(([step, title, text]) => (
                <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 font-display font-bold text-white">{step}</span>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {/* <InfoCard icon={HiShieldCheck} title="No claim fees" text="Do not send gift cards, bank transfers, card details, OTP codes, or deposits to claim a prize." /> */}
          <InfoCard icon={HiMail} title="Official support" text={`Questions should go to ${config.supportEmail}.`} />
          <InfoCard icon={HiTruck} title="Delivery review" text="Approved prizes may be fulfilled by cash, cheque, FedEx, or another verified courier process." />
        </div>

        <div className="mt-8 rounded-3xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex gap-3">
            <HiExclamation className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-700" />
            <div>
              <p className="font-display font-bold text-amber-950">Security notice</p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Anyone asking you for your password before receiving a prize is not following a safe claim process.{" "}
                Keep claim tokens and secure links private.{" "}
                <Link to="/report" className="font-semibold underline">Report suspicious activity</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RewardCard({ pack }) {
  return (
    <article className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:rounded-[1.4rem] lg:min-h-[720px] ${pack.featured ? "border-slate-950" : "border-slate-200"}`}>
      {pack.badge && (
        <div className="absolute left-1/2 top-3 z-10 max-w-[calc(100%-2rem)] -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-700 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg shadow-emerald-900/20 sm:px-7 sm:py-3 sm:text-sm">
          {pack.badge}
        </div>
      )}

      <div className={`px-5 pb-6 text-center sm:px-6 sm:pb-8 lg:px-8 ${pack.badge ? "pt-20 sm:pt-24" : "pt-12 sm:pt-14"}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-sm sm:tracking-[0.24em]">{pack.eyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-950 sm:mt-4 sm:text-3xl">{pack.name}</h2>

        <div className="mt-6 flex flex-wrap items-end justify-center gap-x-3 gap-y-1 sm:mt-7 sm:gap-x-4">
          <span className="pb-1 text-xl text-slate-400 line-through sm:text-2xl">{pack.previousEntries}</span>
          <span className="min-w-0 break-words font-display text-5xl font-extrabold leading-none tracking-normal text-slate-950 sm:text-6xl xl:text-7xl">{pack.entries}</span>
        </div>
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 sm:text-sm sm:tracking-[0.2em]">Entries</p>

        <p className="mt-5 font-display text-3xl font-extrabold text-slate-950 sm:mt-6 sm:text-4xl">{pack.price}</p>

        {/* Chance to win callout */}
        <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-3 sm:px-4">
          <div className="flex items-center justify-center gap-1.5">
            <HiStar className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            <p className="text-xs font-bold text-yellow-800">
              Chance to win up to <span className="text-orange-700">$150,000</span>
            </p>
            <HiStar className="h-4 w-4 flex-shrink-0 text-yellow-500" />
          </div>
          <p className="mt-1 text-[11px] text-yellow-700">Prize delivered by Cash or Cheque to your address</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-slate-100 px-5 py-6 sm:px-6 sm:py-7 lg:px-8">
        <ul className="space-y-4 sm:space-y-5">
          {pack.features.map((feature) => (
            <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-600 sm:gap-4 sm:text-base lg:text-lg xl:text-xl xl:leading-7">
              <HiCheck className={`mt-0.5 h-5 w-5 flex-shrink-0 sm:mt-1 ${pack.featured ? "text-orange-600" : "text-slate-500"}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          to={`/reward-review/${pack.id}`}
          className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display text-base font-extrabold text-white shadow-lg transition ${
            pack.featured ? "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700" : "bg-slate-700 shadow-slate-800/10 hover:bg-slate-900"
          }`}
        >
          <HiGift className="h-5 w-5" />
          Start Secure Review
        </Link>
      </div>
    </article>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
