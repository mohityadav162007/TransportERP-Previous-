import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    loading_date: "",
    unloading_date: "",

    route_from: "",
    route_to: "",

    vehicle_number: "",
    driver_phone: "",

    motor_owner_name: "",
    motor_owner_number: "",

    gaadi_freight: "",
    gaadi_advance: "",

    party_name: "",
    party_phone: "",
    party_freight: "",
    party_advance: "",

    tds: "",
    himmali: "",

    weight: "",
    remark: "",

    party_payment_status: "UNPAID"
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await api.post("/trips", {
        loading_date: form.loading_date,
        unloading_date: form.unloading_date || null,

        from_location: form.route_from,
        to_location: form.route_to,

        vehicle_number: form.vehicle_number,
        driver_number: form.driver_phone || null,

        motor_owner_name: form.motor_owner_name || null,
        motor_owner_number: form.motor_owner_number || null,

        gaadi_freight: Number(form.gaadi_freight),
        gaadi_advance: Number(form.gaadi_advance) || 0,

        party_name: form.party_name,
        party_number: form.party_phone || null,

        party_freight: Number(form.party_freight),
        party_advance: Number(form.party_advance) || 0,

        tds: Number(form.tds) || 0,
        himmali: Number(form.himmali) || 0,

        weight: Number(form.weight) || null,
        remark: form.remark || null,

        payment_status: form.party_payment_status
      });

      navigate("/trips");
    } catch (err) {
      console.error("CREATE TRIP ERROR FULL:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      alert(err.response?.data?.error || "Failed to create trip");
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Create Trip</h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Dates */}
        <section>
          <h2 className="font-semibold mb-3">Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="loading_date"
              required
              className="input"
              onChange={handleChange}
            />
            <input
              type="date"
              name="unloading_date"
              className="input"
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Route */}
        <section>
          <h2 className="font-semibold mb-3">Route</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="route_from"
              placeholder="From"
              required
              className="input"
              onChange={handleChange}
            />
            <input
              name="route_to"
              placeholder="To"
              required
              className="input"
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Vehicle / Driver */}
        <section>
          <h2 className="font-semibold mb-3">Vehicle & Driver</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="vehicle_number"
              placeholder="Vehicle Number"
              required
              className="input"
              onChange={handleChange}
            />
            <input
              name="driver_phone"
              placeholder="Driver Number"
              className="input"
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <input
              name="motor_owner_name"
              placeholder="Motor Owner Name"
              className="input"
              onChange={handleChange}
            />
            <input
              name="motor_owner_number"
              placeholder="Motor Owner Number"
              className="input"
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Gaadi */}
        <section>
          <h2 className="font-semibold mb-3">Gaadi (Cost)</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="gaadi_freight"
              placeholder="Gaadi Freight"
              required
              className="input"
              onChange={handleChange}
            />
            <input
              type="number"
              name="gaadi_advance"
              placeholder="Gaadi Advance"
              className="input"
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Party */}
        <section>
          <h2 className="font-semibold mb-3">Party (Income)</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="party_name"
              placeholder="Party Name"
              required
              className="input"
              onChange={handleChange}
            />
            <input
              name="party_phone"
              placeholder="Party Number"
              className="input"
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <input
              type="number"
              name="party_freight"
              placeholder="Party Freight"
              required
              className="input"
              onChange={handleChange}
            />
            <input
              type="number"
              name="party_advance"
              placeholder="Party Advance"
              className="input"
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Additional Info */}
        <section>
          <h2 className="font-semibold mb-3">Additional Info</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="weight"
              placeholder="Weight (optional)"
              className="input"
              onChange={handleChange}
            />

            <textarea
              name="remark"
              placeholder="Remark (optional)"
              rows={3}
              className="input resize-none"
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Adjustments */}
        <section>
          <h2 className="font-semibold mb-3">Adjustments</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="tds"
              placeholder="TDS"
              className="input"
              onChange={handleChange}
            />
            <input
              type="number"
              name="himmali"
              placeholder="Himmali"
              className="input"
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Status */}
        <section>
          <h2 className="font-semibold mb-3">Status</h2>
          <select
            name="party_payment_status"
            className="input"
            onChange={handleChange}
          >
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
          </select>
        </section>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Trip
          </button>
          <button
            type="button"
            onClick={() => navigate("/trips")}
            className="px-6 py-2 border rounded"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}