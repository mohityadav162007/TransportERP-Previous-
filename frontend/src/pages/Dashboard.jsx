import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import {
  Truck, DollarSign, Receipt, FileText, Coins, Wallet, HandCoins, CircleDollarSign,
  TrendingUp
} from "lucide-react";

import GlassBox from "../components/GlassBox";

import {
  groupByDate,
  statusSplit,
  monthlyProfit,
  getWeeklyTrips
} from "../utils/dashboard";
import { formatCurrency } from "../utils/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(null);

  useEffect(() => {
    api.get("/trips")
      .then(res => setTrips(res.data))
      .catch(() => setTrips([]));
  }, []);

  if (!Array.isArray(trips)) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  /* =========================
     DATA PROCESSING
  ========================= */

  const totalTrips = trips.length;
  const totalPartyFreight = sum(trips, "party_freight");
  const totalGaadiFreight = sum(trips, "gaadi_freight");

  const pendingPODCount = trips.filter(t => t.pod_status !== "UPLOADED").length;
  const pendingPaymentsCount = trips.filter(t => t.payment_status === "UNPAID").length;

  const balanceDue = sum(trips, "party_balance");
  const payable = sum(trips, "gaadi_balance");
  const totalProfit = sum(trips, "profit"); // Simplified monthly profit aggregate

  // Charts
  const profitTrend = monthlyProfit(trips);
  const podData = statusSplit(trips, "pod_status", "UPLOADED", ["Uploaded", "Pending"]);
  const paymentData = statusSplit(trips, "payment_status", "PAID", ["Received", "Pending"]);
  const weeklyTrips = getWeeklyTrips(trips);

  // Tables
  const combinedRecentTrips = [...trips].sort((a, b) => new Date(b.loading_date) - new Date(a.loading_date));
  const recentTripsList = combinedRecentTrips.slice(0, 5);
  const pendingPODList = trips.filter(t => t.pod_status !== "UPLOADED").slice(0, 5);
  const pendingPaymentList = trips.filter(t => t.payment_status === "UNPAID").slice(0, 5);


  return (
    <div className="space-y-6 text-white">

      {/* ===== ROW 1 & 2: KPIs (4 cols) ===== */}
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard title="Total Trips" value={totalTrips} icon={Truck} />
        <KPICard title="Total Freight" value={`₹${formatCurrency(totalPartyFreight)}`} icon={DollarSign} disableFormat />
        <KPICard title="Total Bhada" value={`₹${formatCurrency(totalGaadiFreight)}`} icon={Receipt} disableFormat />
        <KPICard title="Pending POD" value={pendingPODCount} icon={FileText} />

        <KPICard title="Pending Payments" value={pendingPaymentsCount} icon={Coins} />
        <KPICard title="Balance Due" value={`₹${formatCurrency(balanceDue)}`} icon={Wallet} disableFormat />
        <KPICard title="Payable" value={`₹${formatCurrency(payable)}`} icon={HandCoins} disableFormat />
        <KPICard title="Monthly Profit" value={`₹${formatCurrency(totalProfit)}`} icon={CircleDollarSign} disableFormat />
      </div>

      {/* ===== ROW 3: PROFIT GRAPH + STATUS CHARTS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Profit Trend (Spans 2 cols) */}
        <div className="xl:col-span-2 h-full">
          <GlassBox>
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Profit Graph</h3>
              </div>
              <div className="h-64 w-full flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitTrend}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid horizontal={false} vertical={false} stroke="#ffffff10" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#e5e7eb', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#e5e7eb', fontSize: 12 }}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassBox>
        </div>

        {/* POD Status */}
        <div className="h-full">
          <GlassBox>
            <div className="h-full flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-300 self-start mb-4">POD Status</h3>
              <div className="h-48 w-full relative flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={podData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#14b8a6" /> {/* Teal for Uploaded */}
                      <Cell fill="#f43f5e" /> {/* Red for Pending */}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label (Optional) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-24 w-24 rounded-full border-4 border-white/10"></div>
                </div>
              </div>
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span className="text-gray-300">Uploaded</span>
                  </div>
                  <span className="font-bold text-white">{podData[0].value}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-gray-300">Pending</span>
                  </div>
                  <span className="font-bold text-white">{podData[1].value}</span>
                </div>
              </div>
            </div>
          </GlassBox>
        </div>

        {/* Payment Status */}
        <div className="h-full">
          <GlassBox>
            <div className="h-full flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-300 self-start mb-4">Payment Status</h3>
              <div className="h-48 w-full relative flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#14b8a6" /> {/* Teal for Received */}
                      <Cell fill="#f43f5e" /> {/* Red for Pending */}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-24 w-24 rounded-full border-4 border-white/10"></div>
                </div>
              </div>
              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span className="text-gray-300">Received</span>
                  </div>
                  <span className="font-bold text-white">{paymentData[0].value}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-gray-300">Pending</span>
                  </div>
                  <span className="font-bold text-white">{paymentData[1].value}</span>
                </div>
              </div>
            </div>
          </GlassBox>
        </div>
      </div>

      {/* ===== ROW 4: WEEKLY TRIPS + PENDING POD TABLE ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Trips (1 col) */}
        <div className="h-full">
          <GlassBox>
            <div className="h-full flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-6">Weekly Trips</h3>
              <div className="h-64 w-full flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrips}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#e5e7eb', fontSize: 12 }}
                      dy={10}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassBox>
        </div>

        {/* POD Pending Table (2 cols) */}
        <div className="xl:col-span-2 min-h-full">
          <GlassBox>
            <div className="p-4 border-b border-white/10 flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">POD Pending</h3>
            </div>
            <div className="overflow-x-auto">
              <TripTable
                rows={pendingPODList}
                onRowClick={(id) => navigate(`/trips/${id}`)}
              />
            </div>
          </GlassBox>
        </div>
      </div>

      {/* ===== ROW 5: PENDING PAYMENTS + RECENT TRIPS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[300px]">
          <GlassBox>
            <div className="p-4 border-b border-white/10 flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Pending Payments</h3>
            </div>
            <TripTable
              rows={pendingPaymentList}
              onRowClick={(id) => navigate(`/trips/${id}`)}
            />
          </GlassBox>
        </div>

        <div className="min-h-[300px]">
          <GlassBox>
            <div className="p-4 border-b border-white/10 flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Recent Trips</h3>
            </div>
            <TripTable
              rows={recentTripsList}
              onRowClick={(id) => navigate(`/trips/${id}`)}
            />
          </GlassBox>
        </div>
      </div>

    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function KPICard({ title, value, icon: Icon, disableFormat }) {
  return (
    <div className="h-full">
      <GlassBox>
        <div className="flex justify-between items-start h-full">
          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {value}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-400">
              <TrendingUp size={14} />
              <span>5.39%</span>
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-lg text-gray-200">
            <Icon size={24} strokeWidth={1.5} />
          </div>
        </div>
      </GlassBox>
    </div>
  );
}


function TripTable({ rows, onRowClick }) {
  if (rows.length === 0) {
    return <div className="p-8 text-center text-gray-400 text-sm">No data available</div>;
  }
  return (
    <table className="w-full text-xs text-left">
      <thead className="text-gray-400 font-medium uppercase tracking-wider border-b border-white/10">
        <tr>
          <th className="px-6 py-3 font-normal">Trip ID</th>
          <th className="px-6 py-3 font-normal">Date</th>
          <th className="px-6 py-3 font-normal">Route</th>
          <th className="px-6 py-3 font-normal">Vehicle</th>
          <th className="px-6 py-3 font-normal text-right">Party Balance</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.map(t => (
          <tr
            key={t.id}
            className="hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={() => onRowClick(t.id)}
          >
            <td className="px-6 py-4 font-medium text-gray-200 group-hover:text-blue-400">
              {t.trip_code}
            </td>
            <td className="px-6 py-4 text-gray-400">{formatDate(t.loading_date)}</td>
            <td className="px-6 py-4 text-gray-400">
              <span className="block truncate max-w-[100px]" title={t.route_from}>{t.route_from}</span>
            </td>
            <td className="px-6 py-4 text-gray-400">{t.vehicle_number}</td>
            <td className="px-6 py-4 text-right font-medium text-gray-200">
              ₹{t.party_balance}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function sum(arr, key) {
  return arr.reduce((s, i) => s + Number(i[key] || 0), 0);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
}
