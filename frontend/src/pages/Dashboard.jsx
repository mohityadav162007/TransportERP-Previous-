import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

import {
  groupByDate,
  statusSplit,
  monthlyProfit
} from "../utils/dashboard";
import { formatCurrency } from "../utils/format";

const COLORS = ["#22c55e", "#f97316"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(null);

  useEffect(() => {
    api.get("/trips")
      .then(res => setTrips(res.data))
      .catch(() => setTrips([]));
  }, []);

  // ✅ SAFE GUARD (prevents white screen)
  if (!Array.isArray(trips)) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  /* =========================
     SUMMARY
  ========================= */

  const totalTrips = trips.length;
  const totalPartyFreight = sum(trips, "party_freight");
  const totalGaadiFreight = sum(trips, "gaadi_freight");
  const pendingPOD = trips.filter(t => t.pod_status !== "UPLOADED").length;
  const pendingPayments = trips.filter(t => t.party_payment_status === "UNPAID").length;
  const balanceDue = sum(trips, "party_balance");
  const payable = sum(trips, "gaadi_balance");

  /* =========================
     CHART DATA
  ========================= */

  const tripsTrend = groupByDate(trips);
  const profitTrend = monthlyProfit(trips);
  const podData = statusSplit(trips, "pod_status", "UPLOADED");
  const paymentData = statusSplit(trips, "party_payment_status", "PAID");

  /* =========================
     TABLE DATA
  ========================= */

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.loading_date) - new Date(a.loading_date))
    .slice(0, 6);

  const pendingPODTrips = trips
    .filter(t => t.pod_status !== "UPLOADED")
    .slice(0, 6);

  const pendingPaymentTrips = trips
    .filter(t => t.party_payment_status === "UNPAID")
    .slice(0, 6);

  return (
    <div className="h-full overflow-y-auto space-y-8">

      {/* ===== SUMMARY ===== */}
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <KPI title="Total Trips" value={totalTrips} />
          <KPI title="Total Freight (₹)" value={`₹${formatCurrency(totalPartyFreight)}`} />
          <KPI title="Total Bhada (₹)" value={`₹${formatCurrency(totalGaadiFreight)}`} />
          <KPI title="Pending POD" value={pendingPOD} red />
          <KPI title="Pending Payments" value={pendingPayments} red />
          <KPI title="Balance Due (₹)" value={`₹${formatCurrency(balanceDue)}`} red />
          <KPI title="Payable (₹)" value={`₹${formatCurrency(payable)}`} orange />
          <KPI title="System Health" value="Healthy" green />
        </div>
      </section>

      {/* ===== CHARTS ===== */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <ChartCard title="Trips Trend">
            <BarChartBlock data={tripsTrend} />
          </ChartCard>

          <ChartCard title="Freight vs Bhada">
            <BarChartBlock
              data={[
                { name: "Freight", value: totalPartyFreight },
                { name: "Bhada", value: totalGaadiFreight }
              ]}
              xKey="name"
              yKey="value"
            />
          </ChartCard>

          <ChartCard title="Net Profit Trend">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={profitTrend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard title="POD Status">
            <Donut data={podData} />
          </ChartCard>

          <ChartCard title="Payment Status">
            <Donut data={paymentData} />
          </ChartCard>
        </div>
      </section>

      {/* ===== TABLES ===== */}
      <section className="space-y-8 pb-10">
        <TableCard title="Recent Trips">
          <TripTable rows={recentTrips} onRowClick={navigate} />
        </TableCard>

        <TableCard title="Pending PODs">
          <TripTable rows={pendingPODTrips} onRowClick={navigate} />
        </TableCard>

        <TableCard title="Pending Payments">
          <TripTable rows={pendingPaymentTrips} onRowClick={navigate} />
        </TableCard>
      </section>
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function sum(arr, key) {
  return arr.reduce((s, i) => s + Number(i[key] || 0), 0);
}

function KPI({ title, value, red, orange, green }) {
  let color = "";
  if (red) color = "text-red-600 bg-red-50";
  if (orange) color = "text-orange-600 bg-orange-50";
  if (green) color = "text-green-600 bg-green-50";

  return (
    <div className={`bg-white border rounded p-5 ${color}`}>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border rounded p-5">
      <div className="font-semibold mb-4">{title}</div>
      {children}
    </div>
  );
}

function TableCard({ title, children }) {
  return (
    <div className="bg-white border rounded">
      <div className="p-4 font-semibold border-b">{title}</div>
      {children}
    </div>
  );
}

function TripTable({ rows, onRowClick }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-3 text-left">Trip</th>
          <th>Date</th>
          <th>Route</th>
          <th>Vehicle</th>
          <th>Party</th>
          <th className="text-right">Balance</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(t => (
          <tr
            key={t.id}
            className="border-t hover:bg-gray-50 cursor-pointer"
            onClick={() => onRowClick(`/trips/${t.id}`)}
          >
            <td className="p-3 font-medium">{t.trip_code}</td>
            <td>{formatDate(t.loading_date)}</td>
            <td>{t.route_from} → {t.route_to}</td>
            <td>{t.vehicle_number}</td>
            <td>{t.party_name}</td>
            <td className="text-right text-red-600 font-semibold">
              ₹{t.party_balance}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BarChartBlock({ data, xKey = "date", yKey = "count" }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yKey} fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Donut({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB");
}
