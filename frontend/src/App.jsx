import bgImage from "./assets/dashboard-bg.jpg";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TripDetail from "./pages/TripDetail";

import Header from "./layout/Header";

import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import EditTrip from "./pages/EditTrip";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import PaymentHistory from "./pages/PaymentHistory";
import DailyExpenses from "./pages/DailyExpenses";
import OwnTrips from "./pages/OwnTrips";
import PartyDetail from "./pages/PartyDetail";
import MotorOwnerDetail from "./pages/MotorOwnerDetail";
import AdminPanel from "./pages/AdminPanel";

import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col font-sans text-gray-900"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips" element={
            <PrivateRoute>
              <Layout>
                <Trips />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips/new" element={
            <PrivateRoute>
              <Layout>
                <CreateTrip />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips/edit/:id" element={
            <PrivateRoute>
              <Layout>
                <EditTrip />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips/:id" element={
            <PrivateRoute>
              <Layout>
                <TripDetail />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/analytics" element={
            <PrivateRoute>
              <Layout>
                <Analytics />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/reports" element={
            <PrivateRoute>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/payment-history" element={
            <PrivateRoute>
              <Layout>
                <PaymentHistory />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/expenses" element={
            <PrivateRoute>
              <Layout>
                <DailyExpenses />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/own-trips" element={
            <PrivateRoute>
              <Layout>
                <OwnTrips />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/analytics/party/:name" element={
            <PrivateRoute>
              <Layout>
                <PartyDetail />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/analytics/owner/:name" element={
            <PrivateRoute>
              <Layout>
                <MotorOwnerDetail />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/admin-panel" element={
            <PrivateRoute>
              <Layout>
                <AdminPanel />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
