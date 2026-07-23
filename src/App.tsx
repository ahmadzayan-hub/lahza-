import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";

// Route-level code splitting keeps the initial (home) bundle small → better LCP.
const Customize = lazy(() => import("@/pages/Customize"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Corporate = lazy(() => import("@/pages/Corporate"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Delivery = lazy(() => import("@/pages/Delivery"));
const Faq = lazy(() => import("@/pages/Faq"));
const Contact = lazy(() => import("@/pages/Contact"));
const Admin = lazy(() => import("@/pages/admin/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import { Privacy, Terms, Refund } from "@/pages/Legal";

function Loader() {
  return (
    <div className="container-max flex min-h-[40vh] items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Console — standalone chrome */}
        {import.meta.env.VITE_ENABLE_CONSOLE === "true" && <Route path="/console" element={<Admin />} />}

        {/* Public site */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
