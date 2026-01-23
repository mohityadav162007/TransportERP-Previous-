import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import GlassCard from "../components/GlassCard";
import GlassButton from "../components/GlassButton";
import Skeleton from "../components/Skeleton";
import { formatCurrency } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Edit2, FileText, Calendar, MapPin, Truck, User, CreditCard, Printer } from "lucide-react";
import PrintModal from "../components/printing/PrintModal";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

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

  if (!trip) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between">
          <Skeleton width="200px" height="40px" />
          <Skeleton width="200px" height="40px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="200px" className="glass-panel" />
          ))}
        </div>
      </div>
    );
  }

  const openPOD = () => {
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL}/trips/${id}/pod/file?token=${token}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-white pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
            <span onClick={() => navigate('/trips')} className="cursor-pointer hover:text-white">Trips</span>
            <span>/</span>
            <span>Details</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{trip.trip_code}</h1>
        </div>

        <div className="flex gap-3">
          <GlassButton
            variant="secondary"
            onClick={() => navigate("/trips")}
          >
            <ArrowLeft size={18} /> Back
          </GlassButton>

          {/* {user?.role === 'admin' && ( */}
          <GlassButton
            variant="secondary"
            onClick={() => setShowPrintModal(true)}
            className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30"
          >
            <Printer size={18} /> Print Slips
          </GlassButton>
          {/* )} */}

          <GlassButton
            variant="primary"
            onClick={() => navigate(`/trips/edit/${trip.id}`)}
          >
            <Edit2 size={18} /> Edit Trip
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Dates" icon={Calendar}>
          <Item label="Loading Date" value={formatDate(trip.loading_date)} />
          <Item label="Unloading Date" value={formatDate(trip.unloading_date)} />
        </Section>

        <Section title="Route" icon={MapPin}>
          <Item label="From" value={trip.from_location} />
          <Item label="To" value={trip.to_location} />
        </Section>

        <Section title="Vehicle & Driver" icon={Truck}>
          <Item label="Vehicle Number" value={trip.vehicle_number} highlight />
          <Item label="Driver Number" value={trip.driver_number || "-"} />
          <Item label="Motor Owner Name" value={trip.motor_owner_name || "-"} />
          <Item label="Motor Owner Number" value={trip.motor_owner_number || "-"} />
        </Section>

        <Section title="Gaadi (Cost)" icon={CreditCard}>
          <Money label="Gaadi Freight" value={trip.gaadi_freight} />
          <Money label="Gaadi Advance" value={trip.gaadi_advance} />
          <Money label="Gaadi Balance" value={trip.gaadi_balance} />
        </Section>

        <Section title="Party (Income)" icon={User}>
          <Item label="Party Name" value={trip.party_name} highlight />
          <Item label="Party Number" value={trip.party_number || "-"} />
          <Money label="Party Freight" value={trip.party_freight} />
          <Money label="Party Advance" value={trip.party_advance} />
          <Money label="Party Balance" value={trip.party_balance} red />
        </Section>

        <Section title="Financials & Remarks" icon={FileText}>
          <Money label="TDS" value={trip.tds} />
          <Money label="Himmali" value={trip.himmali} />
          <Money label="Profit" value={trip.profit} green />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Status</span>
            <span className={`text-[10px] w-fit px-2 py-0.5 rounded-full font-bold ${trip.party_payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {trip.party_payment_status}
            </span>
          </div>
          <div className="md:col-span-2 mt-4 pt-4 border-t border-white/5">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Remark</div>
            <p className="text-sm text-white/80">{trip.remark || "-"}</p>
          </div>
        </Section>

        <Section title="Additional Info" icon={FileText}>
          <Item label="Weight" value={trip.weight ? `${trip.weight} MT` : "-"} />
        </Section>

        <div className="md:col-span-2">
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">POD Documents</h2>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${(trip.pod_status === 'UPLOADED' || trip.pod_status === 'RECEIVED') ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {(trip.pod_status === 'UPLOADED' || trip.pod_status === 'RECEIVED') ? 'RECEIVED' : 'PENDING'}
              </span>
            </div>
            <div className="p-4">
              <PodGallery podPath={trip.pod_path} />
            </div>
          </GlassCard>
        </div>

      </div>

      {showPrintModal && (
        <PrintModal
          trip={trip}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );
}

function PodGallery({ podPath }) {
  let pods = [];

  if (podPath) {
    if (typeof podPath === 'string') {
      try {
        const parsed = JSON.parse(podPath);
        if (Array.isArray(parsed)) {
          pods = parsed;
        } else if (parsed) {
          pods = [parsed];
        }
      } catch (e) {
        pods = podPath.split(',')
          .map(url => url.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(podPath)) {
      pods = podPath;
    }
  }

  const getThumbnail = (url) => {
    if (url.toLowerCase().endsWith(".pdf")) {
      return "https://cdn-icons-png.flaticon.com/512/337/337946.png";
    }
    return url.replace("/upload/", "/upload/w_300,q_auto,f_auto/");
  };

  if (pods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-lg text-white/40">
        <FileText size={32} className="mb-2 opacity-50" />
        <span className="text-sm">No POD documents uploaded</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {pods.map((url, index) => {
          const isPdf = url.toLowerCase().endsWith(".pdf");
          return (
            <div
              key={index}
              className="group relative aspect-square bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all"
              onClick={() => window.open(url, "_blank")}
            >
              <img
                src={getThumbnail(url)}
                alt={`POD ${index + 1}`}
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isPdf ? "p-4 object-contain" : ""}`}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-2 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-blue-600 px-3 py-1.5 rounded shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  {isPdf ? "Open PDF" : "View"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-blue-400" />}
        <h2 className="text-xs font-bold text-white uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-5 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
          {children}
        </div>
      </div>
    </GlassCard>
  );
}

function Item({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-sm font-medium ${highlight ? "text-white text-lg" : "text-white/90"}`}>{value}</div>
    </div>
  );
}

function Money({ label, value, red, green }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${red ? "text-rose-400" : green ? "text-emerald-400" : "text-white"}`}>
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
