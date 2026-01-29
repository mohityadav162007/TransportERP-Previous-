import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TransitionProvider } from "./context/TransitionContext";
import Layout from "./layout/Layout";
import PrivateRoute from "./components/PrivateRoute";
import PageTransition from "./components/PageTransition";
import { AnimatePresence } from "framer-motion";

// Lazy Load Pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Trips = lazy(() => import("./pages/Trips"));
const CreateTrip = lazy(() => import("./pages/CreateTrip"));
const EditTrip = lazy(() => import("./pages/EditTrip"));
const TripDetail = lazy(() => import("./pages/TripDetail"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const DailyExpenses = lazy(() => import("./pages/DailyExpenses"));
const OwnTrips = lazy(() => import("./pages/OwnTrips"));
const PartyDetail = lazy(() => import("./pages/PartyDetail"));
const MotorOwnerDetail = lazy(() => import("./pages/MotorOwnerDetail"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const PodsPage = lazy(() => import("./pages/PodsPage"));

// Simple Loading Component
const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center p-20">
    <div className="h-8 w-8 animate-spin rounded-full border-blue-500 border-t-transparent" />
  </div>
);

function AuthenticatedRoutes() {
  const location = useLocation();

  return (
    <PrivateRoute>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              } />

              <Route path="/trips" element={
                <PageTransition>
                  <Trips />
                </PageTransition>
              } />

              <Route path="/trips/new" element={
                <PageTransition>
                  <CreateTrip />
                </PageTransition>
              } />

              <Route path="/trips/edit/:id" element={
                <PageTransition>
                  <EditTrip />
                </PageTransition>
              } />

              <Route path="/trips/:id" element={
                <PageTransition>
                  <TripDetail />
                </PageTransition>
              } />

              <Route path="/analytics" element={
                <PageTransition>
                  <Analytics />
                </PageTransition>
              } />

              <Route path="/reports" element={
                <PageTransition>
                  <Reports />
                </PageTransition>
              } />

              <Route path="/payment-history" element={
                <PageTransition>
                  <PaymentHistory />
                </PageTransition>
              } />

              <Route path="/expenses" element={
                <PageTransition>
                  <DailyExpenses />
                </PageTransition>
              } />

              <Route path="/own-trips" element={
                <PageTransition>
                  <OwnTrips />
                </PageTransition>
              } />

              <Route path="/analytics/party/:name" element={
                <PageTransition>
                  <PartyDetail />
                </PageTransition>
              } />

              <Route path="/analytics/owner/:name" element={
                <PageTransition>
                  <MotorOwnerDetail />
                </PageTransition>
              } />

              <Route path="/admin-panel" element={
                <PageTransition>
                  <AdminPanel />
                </PageTransition>
              } />

              {/* Point /courier to PodsPage */}
              <Route path="/courier" element={
                <PageTransition>
                  <PodsPage />
                </PageTransition>
              } />

              {/* Fallback within authenticated app */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
    </PrivateRoute >
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TransitionProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* All other routes are handled by AuthenticatedRoutes which includes Layout */}
              <Route path="/*" element={<AuthenticatedRoutes />} />
            </Routes>
          </Suspense>
        </TransitionProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
