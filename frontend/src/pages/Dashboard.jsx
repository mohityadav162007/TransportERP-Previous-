import { useEffect, useState } from "react";
import { use3DNavigate } from "../hooks/use3DNavigate";
import api from "../services/api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import {
  Truck, DollarSign, Receipt, FileText, Coins, Wallet, HandCoins, CircleDollarSign,
  ArrowRight, MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";

import {
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
            <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-muted/50 animate-pulse" />
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

  return (
    <div className="space-y-8">

      {/* ===== ROW 1 & 2: KPIs (4 cols) ===== */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard title="Total Trips" value={totalTrips} icon={Truck} className="border-l-4 border-l-blue-500" />
        <KPICard title="Total Freight" value={`₹${formatCurrency(totalPartyFreight)}`} icon={DollarSign} className="border-l-4 border-l-emerald-500" />
        <KPICard title="Total Bhada" value={`₹${formatCurrency(totalGaadiFreight)}`} icon={Receipt} className="border-l-4 border-l-orange-500" />
        <KPICard title="Pending POD" value={pendingPODCount} icon={FileText} className="border-l-4 border-l-amber-500" alert={pendingPODCount > 0} />

        <KPICard title="Pending Payments" value={pendingPaymentsCount} icon={Coins} className="border-l-4 border-l-rose-500" alert={pendingPaymentsCount > 0} />
        <KPICard title="Balance Due" value={`₹${formatCurrency(balanceDue)}`} icon={Wallet} className="border-l-4 border-l-indigo-500" />
        <KPICard title="Payable" value={`₹${formatCurrency(payable)}`} icon={HandCoins} className="border-l-4 border-l-cyan-500" />
        <KPICard title="Monthly Profit" value={`₹${formatCurrency(totalProfit)}`} icon={CircleDollarSign} className="border-l-4 border-l-green-500" />
      </div>

      {/* ===== ROW 3: PROFIT GRAPH + STATUS CHARTS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
        {/* Profit Trend (Spans 4 cols) */}
        <Card className="xl:col-span-4 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Profit Analytics</CardTitle>
            <CardDescription>Monthly profit trends for the current year</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitTrend}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* POD Status */}
        <Card className="xl:col-span-3 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>POD and Payment status overview</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 grid grid-cols-2 gap-4">
            <div className="relative h-[200px]">
              <h4 className="text-sm font-medium text-center mb-2">POD Status</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={podData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    cornerRadius={4}
                    stroke="none"
                  >
                    <Cell fill="hsl(var(--primary))" /> {/* Received */}
                    <Cell fill="hsl(var(--destructive))" /> {/* Pending */}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 top-6 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold">{Math.round((podData[0].value / (podData[0].value + podData[1].value || 1)) * 100)}%</span>
                <span className="text-[10px] text-muted-foreground">Received</span>
              </div>
            </div>

            <div className="relative h-[200px]">
              <h4 className="text-sm font-medium text-center mb-2">Payment Status</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    cornerRadius={4}
                    stroke="none"
                  >
                    <Cell fill="hsl(var(--primary))" /> {/* Paid */}
                    <Cell fill="hsl(var(--destructive))" /> {/* Pending */}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 top-6 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold">{Math.round((paymentData[0].value / (paymentData[0].value + paymentData[1].value || 1)) * 100)}%</span>
                <span className="text-[10px] text-muted-foreground">Paid</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== ROW 4: DATA TABLES ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTableCard
          title="POD Pending"
          count={pendingPODCount}
          data={pendingPODList}
          navigate={navigate}
          type="pod"
        />
        <DataTableCard
          title="Recent Trips"
          data={recentTripsList}
          navigate={navigate}
          type="trip"
        />
      </div>

    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function KPICard({ title, value, icon: Icon, alert, className, ...props }) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)} {...props}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-full bg-primary/10 text-primary", alert && "bg-destructive/10 text-destructive")}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}

function DataTableCard({ title, count, data, navigate, type }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {count !== undefined && count > 0 && (
            <span className="bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full font-medium">{count}</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="gap-1">
          View All <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((row, i) => (
            <div
              key={i}
              onClick={() => navigate(`/trips/${row.trip_code}`)}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{row.trip_code}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(row.loading_date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{row.party_balance}</p>
                <p className="text-xs text-muted-foreground">{row.route_from}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
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
