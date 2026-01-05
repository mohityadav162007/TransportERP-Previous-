import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TripDetail from "./pages/TripDetail";

import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import EditTrip from "./pages/EditTrip";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
