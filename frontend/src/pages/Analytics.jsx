import { useEffect, useState } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

export default function Analytics() {
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
        partyMap[t.party_name].balance += Number(t.party_balance || 0);
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
        ownerMap[owner].balance += Number(t.gaadi_balance || 0);
        ownerMap[owner].profit += Number(t.profit || 0);
      });

      setPartyStats(Object.values(partyMap));
      setOwnerStats(Object.values(ownerMap));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* PARTY WISE */}
      <section>
        <h2 className="font-semibold mb-4">Party-wise Analytics</h2>
        <Table
          headers={[
            "Party",
            "Trips",
            "Freight",
            "Advance",
            "Outstanding",
            "Profit"
          ]}
          rows={partyStats.map(p => [
            p.party,
            p.trips,
            `₹${formatCurrency(p.freight)}`,
            `₹${formatCurrency(p.advance)}`,
            <span className={p.balance > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
              ₹{formatCurrency(p.balance)}
            </span>,
            `₹${formatCurrency(p.profit)}`
          ])}
        />
      </section>

      {/* MOTOR OWNER WISE */}
      <section>
        <h2 className="font-semibold mb-4">Motor Owner-wise Analytics</h2>
        <Table
          headers={[
            "Motor Owner",
            "Trips",
            "Freight",
            "Advance",
            "Balance",
            "Profit"
          ]}
          rows={ownerStats.map(o => [
            o.owner,
            o.trips,
            `₹${formatCurrency(o.freight)}`,
            `₹${formatCurrency(o.advance)}`,
            <span className={o.balance > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
              ₹{formatCurrency(o.balance)}
            </span>,
            `₹${formatCurrency(o.profit)}`
          ])}
        />
      </section>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto bg-white border rounded shadow">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {headers.map(h => (
              <th key={h} className="p-2 text-left text-sm font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="p-2 text-sm">
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
