import { config } from "../config";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-blue-900 mb-1">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">1. Who we are</h2>
          <p>{config.companyName} operates this prize claim portal. For data enquiries, contact <a href={`mailto:${config.supportEmail}`} className="text-blue-600 hover:underline">{config.supportEmail}</a>.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">2. What information we collect</h2>
          <p>When you submit a prize claim, we collect your full name, email address, phone number, delivery address, and your prize reference number. We may also collect your preferred delivery time and an optional monthly income range.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">3. Why we collect it</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>To verify your identity as the named prize winner</li>
            <li>To arrange and coordinate delivery of your prize</li>
            <li>To communicate with you about your claim status</li>
            <li>To meet any legal obligations</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">4. What we do NOT collect</h2>
          <p>We do <strong>not</strong> collect bank account details, card numbers, PINs, passwords, or OTP codes. We will never ask for these.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">5. How we store your data</h2>
          <p>Your data is stored securely in an encrypted database. Access is restricted to authorised staff only. We retain claim data for as long as necessary to fulfil your prize and meet legal obligations.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">6. Sharing your data</h2>
          <p>We may share your delivery address with our courier partner (such as FedEx or another approved courier) solely for the purpose of delivering your prize. We do not sell your data to third parties or use it for marketing.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900 text-base mb-2">7. Your rights</h2>
          <p>You have the right to access, correct, or request deletion of your personal data. Contact us at <a href={`mailto:${config.supportEmail}`} className="text-blue-600 hover:underline">{config.supportEmail}</a>.</p>
        </section>
      </div>
    </div>
  );
}
