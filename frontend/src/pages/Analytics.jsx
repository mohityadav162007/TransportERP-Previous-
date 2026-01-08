import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassBox from "../components/GlassBox";
import { formatCurrency } from "../utils/format";

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
    return <div className="text-white p-8 italic">Loading analytics...</div>;
  }

  return (
    <div className="space-y-10 text-white">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* PARTY WISE */}
      <section>
        <h2 className="font-semibold mb-4 text-gray-300">Party-wise Analytics</h2>
        <GlassBox>
          <Table
            headers={[
              "Party",
              "Trips",
              "Freight",
              "Advance",
              "Outstanding",
              "Status",
              "Profit"
            ]}
            rows={partyStats.map(p => [
              <span
                key="p-name"
                className="text-blue-400 font-medium cursor-pointer hover:underline"
                onClick={() => navigate(`/analytics/party/${encodeURIComponent(p.party)}`)}
              >
                {p.party}
              </span>,
              p.trips,
              `₹${formatCurrency(p.freight)}`,
              `₹${formatCurrency(p.advance)}`,
              <span key="p-bal" className={p.balance > 0 ? "text-rose-400 font-semibold" : "text-green-400 font-semibold"}>
                ₹{formatCurrency(p.balance)}
              </span>,
              <span key="p-status" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.balance > 0 ? "bg-rose-500/20 text-rose-400" : "bg-green-500/20 text-green-400"}`}>
                {p.balance > 0 ? "PENDING" : "SETTLED"}
              </span>,
              `₹${formatCurrency(p.profit)}`
            ])}
          />
        </GlassBox>
      </section>

      {/* MOTOR OWNER WISE */}
      <section>
        <h2 className="font-semibold mb-4 text-gray-300">Motor Owner-wise Analytics</h2>
        <GlassBox>
          <Table
            headers={[
              "Motor Owner",
              "Trips",
              "Freight",
              "Advance",
              "Balance",
              "Status",
              "Profit"
            ]}
            rows={ownerStats.map(o => [
              <span
                key="o-name"
                className="text-blue-400 font-medium cursor-pointer hover:underline"
                onClick={() => navigate(`/analytics/owner/${encodeURIComponent(o.owner)}`)}
              >
                {o.owner}
              </span>,
              o.trips,
              `₹${formatCurrency(o.freight)}`,
              `₹${formatCurrency(o.advance)}`,
              <span key="o-bal" className={o.balance > 0 ? "text-rose-400 font-semibold" : "text-green-400 font-semibold"}>
                ₹{formatCurrency(o.balance)}
              </span>,
              <span key="o-status" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.balance > 0 ? "bg-rose-500/20 text-rose-400" : "bg-green-500/20 text-green-400"}`}>
                {o.balance > 0 ? "PENDING" : "SETTLED"}
              </span>,
              `₹${formatCurrency(o.profit)}`
            ])}
          />
        </GlassBox>
      </section>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="border-b border-white/10">
          <tr>
            {headers.map(h => (
              <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 tracking-wider uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="p-4 text-sm text-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
