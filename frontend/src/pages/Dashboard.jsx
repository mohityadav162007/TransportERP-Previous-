import { useEffect, useState } from "react";
import { use3DNavigate } from "../hooks/use3DNavigate";
import api from "../services/api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import {
  Truck, DollarSign, Receipt, FileText, Coins, Wallet, HandCoins, CircleDollarSign,
  TrendingUp, ArrowRight
} from "lucide-react";


import GlassCard from "../components/GlassCard";
import GlassTable from "../components/GlassTable";
import Skeleton from "../components/Skeleton";

import {
  groupByDate,
  statusSplit,
  monthlyProfit,
  getWeeklyTrips
} from "../utils/dashboard";
import { formatCurrency } from "../utils/format";

export default function Dashboard() {
  const { navigate } = use3DNavigate();
  const [trips, setTrips] = useState(null);

  useEffect(() => {
    api.get("/trips")
      .then(res => setTrips(res.data))
      .catch(() => setTrips([]));
  }, []);

  if (!trips) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} height="120px" className="glass-panel" />
          ))}
        </div>
        <Skeleton height="300px" className="glass-panel" />
      </div>
    );
  }

  /* =========================
     DATA PROCESSING
  ========================= */

  const totalTrips = trips.length;
  const totalPartyFreight = sum(trips, "party_freight");
  const totalGaadiFreight = sum(trips, "gaadi_freight");

  const pendingPODCount = trips.filter(t => t.pod_status !== "UPLOADED" && t.pod_status !== "RECEIVED").length;
  const pendingPaymentsCount = trips.filter(t => t.payment_status === "UNPAID").length;

  const balanceDue = sum(trips, "party_balance");
  const payable = sum(trips, "gaadi_balance");
  const totalProfit = sum(trips, "profit");

  // Charts
  const profitTrend = monthlyProfit(trips);
  const podData = statusSplit(trips, "pod_status", ["UPLOADED", "RECEIVED"], ["Received", "Pending"]);
  const paymentData = statusSplit(trips, "payment_status", "PAID", ["Received", "Pending"]);
  const weeklyTrips = getWeeklyTrips(trips);

  // Tables
  const combinedRecentTrips = [...trips].sort((a, b) => new Date(b.loading_date) - new Date(a.loading_date));
  const recentTripsList = combinedRecentTrips.slice(0, 5);
  const pendingPODList = trips.filter(t => t.pod_status !== "UPLOADED" && t.pod_status !== "RECEIVED").slice(0, 5);
  const pendingPaymentList = trips.filter(t => t.payment_status === "UNPAID").slice(0, 5);

  const tableColumns = [
    { header: "Trip ID", accessor: "trip_code", render: (row) => <span className="font-medium text-blue-400">{row.trip_code}</span> },
    { header: "Date", accessor: "loading_date", render: (row) => formatDate(row.loading_date) },
    { header: "Route", accessor: "route_from", render: (row) => <span className="truncate block max-w-[120px]">{row.route_from}</span> },
    { header: "Vehicle", accessor: "vehicle_number" },
    { header: "Balance", accessor: "party_balance", render: (row) => <span className="text-right block">₹{row.party_balance}</span> },
  ];

  return (
    <div className="space-y-6">

      {/* ===== ROW 1 & 2: KPIs (4 cols) ===== */}
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard title="Total Trips" value={totalTrips} icon={Truck} color="blue" layoutId="module-trips" onClick={() => navigate('/trips')} />
        <KPICard title="Total Freight" value={`₹${formatCurrency(totalPartyFreight)}`} icon={DollarSign} color="emerald" layoutId="module-freight" />
        <KPICard title="Total Bhada" value={`₹${formatCurrency(totalGaadiFreight)}`} icon={Receipt} color="orange" layoutId="module-bhada" />
        <KPICard title="Pending POD" value={pendingPODCount} icon={FileText} color="amber" alert={pendingPODCount > 0} layoutId="module-pod" />

        <KPICard title="Pending Payments" value={pendingPaymentsCount} icon={Coins} color="rose" alert={pendingPaymentsCount > 0} layoutId="module-payments" onClick={() => navigate('/payment-history')} />
        <KPICard title="Balance Due" value={`₹${formatCurrency(balanceDue)}`} icon={Wallet} color="indigo" layoutId="module-balance" />
        <KPICard title="Payable" value={`₹${formatCurrency(payable)}`} icon={HandCoins} color="cyan" layoutId="module-payable" />
        <KPICard title="Monthly Profit" value={`₹${formatCurrency(totalProfit)}`} icon={CircleDollarSign} color="green" layoutId="module-profit" />
      </div>

      {/* ===== ROW 3: PROFIT GRAPH + STATUS CHARTS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Profit Trend (Spans 2 cols) */}
        <div className="xl:col-span-2 h-full">
          <GlassCard className="h-full flex flex-col">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Profit Analytics</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white/70 outline-none">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-64 w-full flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitTrend}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5, 8, 15, 0.9)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* POD Status */}
        <div className="h-full">
          <GlassCard className="h-full flex flex-col">
            <h3 className="text-sm font-semibold text-white/80 mb-4">POD Status</h3>
            <div className="h-48 w-full relative flex-grow ">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={podData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    cornerRadius={4}
                    stroke="none"
                  >
                    <Cell fill="#10b981" /> {/* Received - Green */}
                    <Cell fill="#f43f5e" /> {/* Pending - Red */}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5, 8, 15, 0.9)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{Math.round((podData[0].value / (podData[0].value + podData[1].value || 1)) * 100)}%</span>
                <span className="text-xs text-white/50">Completed</span>
              </div>
            </div>
            <div className="flex justify-between px-4 mt-2">
              <div className="text-center">
                <p className="text-xs text-white/50">Received</p>
                <p className="text-lg font-bold text-emerald-400">{podData[0].value}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/50">Pending</p>
                <p className="text-lg font-bold text-rose-400">{podData[1].value}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Payment Status */}
        <div className="h-full">
          <GlassCard className="h-full flex flex-col">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Payment Status</h3>
            <div className="h-48 w-full relative flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    cornerRadius={4}
                    stroke="none"
                  >
                    <Cell fill="#3b82f6" /> {/* Paid - Blue */}
                    <Cell fill="#f59e0b" /> {/* Pending - Amber */}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5, 8, 15, 0.9)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{Math.round((paymentData[0].value / (paymentData[0].value + paymentData[1].value || 1)) * 100)}%</span>
                <span className="text-xs text-white/50">Paid</span>
              </div>
            </div>
            <div className="flex justify-between px-4 mt-2">
              <div className="text-center">
                <p className="text-xs text-white/50">Received</p>
                <p className="text-lg font-bold text-blue-400">{paymentData[0].value}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/50">Pending</p>
                <p className="text-lg font-bold text-amber-500">{paymentData[1].value}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ===== ROW 4: WEEKLY TRIPS + PENDING POD TABLE ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Trips (1 col) */}
        <div className="h-full">
          <GlassCard className="h-full flex flex-col">
            <h3 className="text-sm font-semibold text-white mb-6">Weekly Activity</h3>
            <div className="h-64 w-full flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrips}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(5, 8, 15, 0.9)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={24}>
                    {weeklyTrips.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#3b82f6' : 'rgba(255,255,255,0.1)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* POD Pending Table (2 cols) */}
        <div className="xl:col-span-2 min-h-full">
          <GlassTableHeader title="POD Pending" count={pendingPODCount} onClick={() => navigate('/trips', { transition: 'card' })} />
          <div className="glass-panel overflow-hidden">
            <GlassTable
              columns={tableColumns}
              data={pendingPODList}
              onRowClick={(row) => navigate(`/trips/${row.id}`, { transition: 'stack' })}
            />
          </div>
        </div>
      </div>

      {/* ===== ROW 5: PENDING PAYMENTS + RECENT TRIPS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[300px]">
          <GlassTableHeader title="Pending Payments" count={pendingPaymentsCount} onClick={() => navigate('/trips', { transition: 'card' })} />
          <div className="glass-panel overflow-hidden">
            <GlassTable
              columns={tableColumns}
              data={pendingPaymentList}
              onRowClick={(row) => navigate(`/trips/${row.id}`, { transition: 'stack' })}
            />
          </div>
        </div>

        <div className="min-h-[300px]">
          <GlassTableHeader title="Recent Trips" onClick={() => navigate('/trips', { transition: 'card' })} />
          <div className="glass-panel overflow-hidden">
            <GlassTable
              columns={tableColumns}
              data={recentTripsList}
              onRowClick={(row) => navigate(`/trips/${row.id}`, { transition: 'stack' })}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function KPICard({ title, value, icon: Icon, color, alert, layoutId, ...props }) {
  const colors = {
    blue: "text-blue-400 bg-blue-400/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
    orange: "text-orange-400 bg-orange-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    rose: "text-rose-400 bg-rose-400/10",
    indigo: "text-indigo-400 bg-indigo-400/10",
    cyan: "text-cyan-400 bg-cyan-400/10",
    green: "text-green-400 bg-green-400/10",
  };

  const theme = colors[color] || colors.blue;

  return (
    <GlassCard className={`relative overflow-hidden group ${alert ? 'border-orange-500/30' : ''}`} interactive layoutId={layoutId} {...props}>
      {alert && (
        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-500 animate-pulse m-3" />
      )}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${theme}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
        {/* Decorative background blob */}
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${theme.split(' ')[1]} blur-2xl opacity-20 pointer-events-none`} />
      </div>

      <div>
        <p className="text-sm font-medium text-white/50 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </GlassCard>
  );
}

function GlassTableHeader({ title, count, onClick }) {
  return (
    <div className="flex justify-between items-center mb-3 px-1">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {count !== undefined && (
          <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      <button
        onClick={onClick}
        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
      >
        View All <ArrowRight size={12} />
      </button>
    </div>
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
