import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassTable from "../components/GlassTable";
import Skeleton from "../components/Skeleton";
import { formatCurrency } from "../utils/format";
import { PieChart, TrendingUp } from "lucide-react";

export default function Analytics() {
  const navigate = useNavigate();
  const [partyStats, setPartyStats] = useState([]);
  const [ownerStats, setOwnerStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/trips").then(res => {
      const trips = res.data;

      /* PARTY WISE */
      const partyMap = {};
      trips.forEach(t => {
        if (!partyMap[t.party_name]) {
          partyMap[t.party_name] = {
            id: t.party_name, // Unique key for GlassTable
            party: t.party_name,
            trips: 0,
            freight: 0,
            advance: 0,
            balance: 0,
            profit: 0
          };
        }

        partyMap[t.party_name].trips += 1;
        partyMap[t.party_name].freight += Number(t.party_freight || 0);
        partyMap[t.party_name].advance += Number(t.party_advance || 0);

        const pStatus = t.party_payment_status || t.payment_status;
        const pBalance = pStatus === 'PAID' ? 0 : Number(t.party_balance || 0);
        partyMap[t.party_name].balance += pBalance;

        partyMap[t.party_name].profit += Number(t.profit || 0);
      });

      /* MOTOR OWNER WISE */
      const ownerMap = {};
      trips.forEach(t => {
        const owner = t.motor_owner_name || "Unknown";

        if (!ownerMap[owner]) {
          ownerMap[owner] = {
            id: owner, // Unique key
            owner,
            trips: 0,
            freight: 0,
            advance: 0,
            balance: 0,
            profit: 0
          };
        }

        ownerMap[owner].trips += 1;
        ownerMap[owner].freight += Number(t.gaadi_freight || 0);
        ownerMap[owner].advance += Number(t.gaadi_advance || 0);

        const oBalance = t.gaadi_balance_status === 'PAID' ? 0 : Number(t.gaadi_balance || 0);
        ownerMap[owner].balance += oBalance;

        ownerMap[owner].profit += Number(t.profit || 0);
      });

      setPartyStats(Object.values(partyMap));
      setOwnerStats(Object.values(ownerMap));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="space-y-4">
          <Skeleton width="200px" height="30px" />
          <Skeleton height="300px" className="glass-panel" />
        </div>
        <div className="space-y-4">
          <Skeleton width="200px" height="30px" />
          <Skeleton height="300px" className="glass-panel" />
        </div>
      </div>
    );
  }

  const partyColumns = [
    {
      header: "Party Name",
      accessor: "party",
      render: (row) => (
        <span
          className="text-blue-400 font-medium cursor-pointer hover:underline"
          onClick={() => navigate(`/analytics/party/${encodeURIComponent(row.party)}`)}
        >
          {row.party}
        </span>
      )
    },
    { header: "Trips", accessor: "trips" },
    { header: "Freight", accessor: "freight", render: (row) => `₹${formatCurrency(row.freight)}` },
    { header: "Advance", accessor: "advance", render: (row) => `₹${formatCurrency(row.advance)}` },
    {
      header: "Outstanding",
      accessor: "balance",
      render: (row) => (
        <span className={row.balance > 0 ? "text-rose-400 font-semibold" : "text-green-400 font-semibold"}>
          ₹{formatCurrency(row.balance)}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.balance > 0 ? "bg-rose-500/20 text-rose-400" : "bg-green-500/20 text-green-400"}`}>
          {row.balance > 0 ? "PENDING" : "SETTLED"}
        </span>
      )
    },
    { header: "Profit", accessor: "profit", render: (row) => `₹${formatCurrency(row.profit)}` },
  ];

  const ownerColumns = [
    {
      header: "Motor Owner",
      accessor: "owner",
      render: (row) => (
        <span
          className="text-blue-400 font-medium cursor-pointer hover:underline"
          onClick={() => navigate(`/analytics/owner/${encodeURIComponent(row.owner)}`)}
        >
          {row.owner}
        </span>
      )
    },
    { header: "Trips", accessor: "trips" },
    { header: "Freight", accessor: "freight", render: (row) => `₹${formatCurrency(row.freight)}` },
    { header: "Advance", accessor: "advance", render: (row) => `₹${formatCurrency(row.advance)}` },
    {
      header: "Balance",
      accessor: "balance",
      render: (row) => (
        <span className={row.balance > 0 ? "text-rose-400 font-semibold" : "text-green-400 font-semibold"}>
          ₹{formatCurrency(row.balance)}
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.balance > 0 ? "bg-rose-500/20 text-rose-400" : "bg-green-500/20 text-green-400"}`}>
          {row.balance > 0 ? "PENDING" : "SETTLED"}
        </span>
      )
    },
    { header: "Profit", accessor: "profit", render: (row) => `₹${formatCurrency(row.profit)}` },
  ];

  return (
    <div className="space-y-10 text-white pb-20">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <TrendingUp className="text-blue-400" /> Analytics
      </h1>

      {/* PARTY WISE */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="text-blue-400" size={18} />
          <h2 className="font-semibold text-lg text-white">Party-wise Analytics</h2>
        </div>
        <div className="glass-panel overflow-hidden">
          <GlassTable columns={partyColumns} data={partyStats} />
        </div>
      </section>

      {/* MOTOR OWNER WISE */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="text-rose-400" size={18} />
          <h2 className="font-semibold text-lg text-white">Motor Owner-wise Analytics</h2>
        </div>
        <div className="glass-panel overflow-hidden">
          <GlassTable columns={ownerColumns} data={ownerStats} />
        </div>
      </section>
    </div>
  );
}
