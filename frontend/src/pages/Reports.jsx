import { useEffect, useState } from "react";
import api from "../services/api";
import GlassBox from "../components/GlassBox";

export default function Reports() {
  const [trips, setTrips] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [party, setParty] = useState("");

  useEffect(() => {
    api.get("/trips").then(res => {
      setTrips(res.data);
      setFiltered(res.data);
    });
  }, []);

  const applyFilter = () => {
    let data = [...trips];

    if (fromDate) {
      data = data.filter(
        t => new Date(t.loading_date) >= new Date(fromDate)
      );
    }

    if (toDate) {
      data = data.filter(
        t => new Date(t.loading_date) <= new Date(toDate)
      );
    }

    if (party) {
      data = data.filter(
        t => t.party_name.toLowerCase().includes(party.toLowerCase())
      );
    }

    setFiltered(data);
  };

  const exportExcel = async () => {
    try {
      const response = await api.get("/reports/trips", {
        params: {
          startDate: fromDate,
          endDate: toDate,
          party: party
        },
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Trips_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export Excel file");
    }
  };

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />
        <input
          type="date"
          className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />
        <input
          placeholder="Party Name"
          className="bg-white/10 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={party}
          onChange={e => setParty(e.target.value)}
        />
        <button
          onClick={applyFilter}
          className="bg-blue-600 text-white rounded px-4 hover:bg-blue-700 transition-colors"
        >
          Apply Filter
        </button>
      </div>

      {/* Export */}
      <div className="flex items-center justify-between">
        <button
          onClick={exportExcel}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all flex items-center gap-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Excel
        </button>

        <div className="text-sm text-gray-400 italic">
          Total {filtered.length} trips match current filters.
        </div>
      </div>
    </div>
  );
}
