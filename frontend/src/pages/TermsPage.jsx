import { config } from "../config";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-blue-900 mb-1">Terms &amp; Conditions</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">1. Use of this portal</h2>
          <p>This portal is provided exclusively for verified prize winners to submit their delivery information. Unauthorised use or attempting to submit fraudulent claims may result in disqualification and legal action.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">2. Accuracy of information</h2>
          <p>By submitting the claim form, you confirm that all information provided is accurate and truthful. Providing false information may result in your claim being voided.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">3. No fees</h2>
          <p>Claiming your prize is free. {config.companyName} will never ask you to pay any fees, taxes, or deposits to receive your prize. If anyone asks you for money in connection with this prize, do not pay and report it immediately.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">4. Delivery</h2>
          <p>Prize delivery is arranged by {config.companyName} and may be handled by FedEx or another approved courier, depending on availability. Delivery timelines are estimates only.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">5. Token and link validity</h2>
          <p>Claim links are unique to each winner and are valid for a limited period. Expired or already-used links cannot be resubmitted. Contact our support team if you have difficulties.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">6. Contact</h2>
          <p>For questions, contact <a href={`mailto:${config.supportEmail}`} className="text-blue-600 hover:underline">{config.supportEmail}</a>.</p>
        </section>
      </div>
    </div>
  );
}
