import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import RewardReviewPage from "./pages/RewardReviewPage";
import RewardStatusPage from "./pages/RewardStatusPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import ClaimPage from "./pages/ClaimPage";
import ThankYouPage from "./pages/ThankYouPage";
import HelpPage from "./pages/HelpPage";
import ReportPage from "./pages/ReportPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminClaimsPage from "./pages/AdminClaimsPage";
import DeliveryTrackingPage from "./pages/DeliveryTrackingPage";
import StatusLookupPage from "./pages/StatusLookupPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/reward-review/:packId" element={<RewardReviewPage />} />
          <Route path="/payment-method/:entryId" element={<PaymentMethodPage />} />
          <Route path="/reward-status/:entryId" element={<RewardStatusPage />} />
          <Route path="/claim/:token" element={<ClaimPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/check-status" element={<StatusLookupPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/areallylongurl-noteasilyrecorgnize" element={<AdminClaimsPage />} />
          <Route path="/delivery/:entryId?" element={<DeliveryTrackingPage />} />
          <Route path="/delivery" element={<DeliveryTrackingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
