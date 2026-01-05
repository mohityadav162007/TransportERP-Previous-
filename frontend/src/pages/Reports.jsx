import { useEffect, useState } from "react";
import api from "../services/api";

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
        responseType: "blob" // Important for file download
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          className="input"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />
        <input
          type="date"
          className="input"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />
        <input
          placeholder="Party Name"
          className="input"
          value={party}
          onChange={e => setParty(e.target.value)}
        />
        <button
          onClick={applyFilter}
          className="bg-blue-600 text-white rounded px-4"
        >
          Apply Filter
        </button>
      </div>

      {/* Export */}
      <div>
        <button
          onClick={exportExcel}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export Excel
        </button>
      </div>

      {/* Preview Count */}
      <div className="text-sm text-gray-600">
        Exporting {filtered.length} trips
      </div>
    </div>
  );
}
