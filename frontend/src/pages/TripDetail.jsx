import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassBox from "../components/GlassBox";
import { formatCurrency } from "../utils/format";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    api.get("/trips").then(res => {
      const found = res.data.find(t => t.id == id);
      if (!found) {
        navigate("/trips");
      } else {
        setTrip(found);
      }
    });
  }, [id, navigate]);

  if (!trip) return <div className="text-white p-8 italic">Loading trip details...</div>;

  const openPOD = () => {
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL}/trips/${id}/pod/file?token=${token}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{trip.trip_code}</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/trips/edit/${trip.id}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all font-medium"
          >
            Edit Trip
          </button>

          <button
            onClick={() => navigate("/trips")}
            className="px-6 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-all text-gray-300 font-medium"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Section title="Dates">
          <Item label="Loading Date" value={formatDate(trip.loading_date)} />
          <Item label="Unloading Date" value={formatDate(trip.unloading_date)} />
        </Section>

        <Section title="Route">
          <Item label="From" value={trip.from_location} />
          <Item label="To" value={trip.to_location} />
        </Section>

        <Section title="Vehicle & Driver">
          <Item label="Vehicle Number" value={trip.vehicle_number} />
          <Item label="Driver Number" value={trip.driver_number || "-"} />
          <Item label="Motor Owner Name" value={trip.motor_owner_name || "-"} />
          <Item label="Motor Owner Number" value={trip.motor_owner_number || "-"} />
        </Section>

        <Section title="Gaadi (Cost)">
          <Money label="Gaadi Freight" value={trip.gaadi_freight} />
          <Money label="Gaadi Advance" value={trip.gaadi_advance} />
          <Money label="Gaadi Balance" value={trip.gaadi_balance} />
        </Section>

        <Section title="Party (Income)">
          <Item label="Party Name" value={trip.party_name} />
          <Item label="Party Number" value={trip.party_number || "-"} />
          <Money label="Party Freight" value={trip.party_freight} />
          <Money label="Party Advance" value={trip.party_advance} />
          <Money label="Party Balance" value={trip.party_balance} red />
        </Section>

        <Section title="Adjustments">
          <Money label="TDS" value={trip.tds} />
          <Money label="Himmali" value={trip.himmali} />
          <Money label="Profit" value={trip.profit} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
            <span className={`text-[10px] w-fit px-2 py-0.5 rounded-full font-bold ${trip.party_payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {trip.party_payment_status}
            </span>
          </div>
        </Section>

        <Section title="Additional Info">
          <Item label="Weight" value={trip.weight ? `${trip.weight} MT` : "-"} />
          <div className="md:col-span-2">
            <Item label="Remark" value={trip.remark || "-"} />
          </div>
        </Section>

        <Section title="POD Document">
          {trip.pod_status === "UPLOADED" ? (
            <button
              onClick={openPOD}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              View Document
            </button>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              POD not uploaded
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <GlassBox>
      <div className="p-1">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 uppercase">
          {children}
        </div>
      </div>
    </GlassBox>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function Money({ label, value, red }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${red ? "text-rose-400" : "text-white"}`}>
        ₹{formatCurrency(value)}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
