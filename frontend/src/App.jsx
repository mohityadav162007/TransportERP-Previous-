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
const CourierManagement = lazy(() => import("./pages/CourierManagement"));

// Simple Loading Component
const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center p-20">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
  </div>
);

function AuthenticatedRoutes() {
  const location = useLocation();

  return (
    <PrivateRoute>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="popLayout" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <PageTransition layoutId="dashboard-page">
                  <Dashboard />
                </PageTransition>
              } />

              <Route path="/trips" element={
                <PageTransition layoutId="module-trips">
                  <Trips />
                </PageTransition>
              } />

              <Route path="/trips/new" element={
                <PageTransition layoutId="module-create-trip">
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
                <PageTransition layoutId="module-analytics">
                  <Analytics />
                </PageTransition>
              } />

              <Route path="/reports" element={
                <PageTransition layoutId="module-reports">
                  <Reports />
                </PageTransition>
              } />

              <Route path="/payment-history" element={
                <PageTransition layoutId="module-payments">
                  <PaymentHistory />
                </PageTransition>
              } />

              <Route path="/expenses" element={
                <PageTransition layoutId="module-expenses">
                  <DailyExpenses />
                </PageTransition>
              } />

              <Route path="/own-trips" element={
                <PageTransition layoutId="module-own">
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
                <PageTransition layoutId="module-admin">
                  <AdminPanel />
                </PageTransition>
              } />

              <Route path="/courier" element={
                <PageTransition layoutId="module-courier">
                  <CourierManagement />
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
