import { useEffect, useState } from "react";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassInput from "../components/GlassInput";
import GlassButton from "../components/GlassButton";
import { Download, FileText, Filter } from "lucide-react";

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

  const applyFilter = (e) => {
    e?.preventDefault();
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
    <div className="space-y-8 text-white max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <FileText size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Trip Reports</h1>
          <p className="text-white/50 text-sm">Generate and export trip data reports</p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
          <Filter size={18} className="text-blue-400" />
          <h2 className="font-semibold text-white uppercase tracking-wider text-sm">Filter Criteria</h2>
        </div>

        <form onSubmit={applyFilter} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <GlassInput
            label="From Date"
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
          <GlassInput
            label="To Date"
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
          <GlassInput
            label="Party Name"
            placeholder="Search Client..."
            value={party}
            onChange={e => setParty(e.target.value)}
          />
          <GlassButton type="submit" variant="primary" className="h-[42px] justify-center">
            Apply Filters
          </GlassButton>
        </form>
      </GlassCard>

      {/* Export */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 glass-panel bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/20">
        <div>
          <h3 className="font-bold text-lg text-emerald-400">Ready to Export</h3>
          <p className="text-sm text-white/60">
            Found <span className="font-bold text-white">{filtered.length}</span> trips matching your criteria.
          </p>
        </div>

        <GlassButton
          onClick={exportExcel}
          variant="secondary"
          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-6 py-3 shadow-lg shadow-emerald-500/10"
        >
          <Download size={18} /> Download Excel Report
        </GlassButton>
      </div>
    </div>
  );
}
