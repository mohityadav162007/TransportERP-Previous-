import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

import { formatCurrency } from "../utils/format";

export default function TripDetail() {
  const { id } = useParams(); // ✅ correct usage
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    api.get("/trips").then(res => {
      // Fix: Compare as Loose Equality or Convert to Number
      const found = res.data.find(t => t.id == id);
      if (!found) {
        navigate("/trips");
      } else {
        setTrip(found);
      }
    });
  }, [id, navigate]);

  if (!trip) return <div>Loading trip details...</div>;

  const openPOD = () => {
    const url = `${import.meta.env.VITE_API_URL}/trips/${id}/pod/file`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{trip.trip_code}</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/trips/edit/${trip.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit
          </button>

          <button
            onClick={() => navigate("/trips")}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        </div>
      </div>

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
        <Item label="Driver Number" value={trip.driver_phone || "-"} />
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
        <Item label="Party Number" value={trip.party_phone || "-"} />
        <Money label="Party Freight" value={trip.party_freight} />
        <Money label="Party Advance" value={trip.party_advance} />
        <Money label="Party Balance" value={trip.party_balance} red />
      </Section>

      <Section title="Adjustments">
        <Money label="TDS" value={trip.tds} />
        <Money label="Himmali" value={trip.himmali} />
        <Money label="Profit" value={trip.profit} />
        <Item label="Payment Status" value={trip.party_payment_status} />
      </Section>

      <Section title="Additional Info">
        <Item label="Weight" value={trip.weight || "-"} />
        <Item label="Remark" value={trip.remark || "-"} />
      </Section>

      <Section title="POD">
        {trip.pod_status === "UPLOADED" ? (
          <button
            onClick={openPOD}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Open POD
          </button>
        ) : (
          <div className="text-red-600 text-sm">POD not uploaded</div>
        )}
      </Section>
    </div>
  );
}

/* ===== Reusable Components ===== */

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded p-5">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function Money({ label, value, red }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-semibold ${red ? "text-red-600" : ""}`}>
        ₹{formatCurrency(value)}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
}
