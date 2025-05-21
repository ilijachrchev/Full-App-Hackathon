import React, { useState, useEffect } from "react";
import { CalendarClock, Bell, ArrowUpDown, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OperationEvents({
  notifyAgent,
  reschedule,
  bumpPriority
}) {
  const [waiting, setWaiting] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the full list and filter for Waiting
  const loadWaiting = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/vesselEvent")
      .then(res => res.json())
      .then(data => {
        console.log("OperationEvents fetched vessels:", data);
        const w = data
          .filter(v => {
            const s = ((v.status ?? v.status) || "").toString().toLowerCase();
            return s ==="waiting"
          })
          .sort((a, b) => {
            const [ah, am] = a.eta_hour.split(":").map(Number);
            const [bh, bm] = b.eta_hour.split(":").map(Number);
            return ah * 60 + am - (bh * 60 + bm);
          });
        setWaiting(w);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load waiting vessels:", err);
        setWaiting([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWaiting();
  }, []);

  // Countdown badge component
  function ETACountdown({ eta }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
      const handle = setInterval(() => setNow(new Date()), 60_000);
      return () => clearInterval(handle);
    }, []);
    const [h, m] = eta.split(":").map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target - now;
    const dh = Math.floor(Math.abs(diff) / 3_600_000);
    const dm = Math.floor((Math.abs(diff) % 3_600_000) / 60_000);
    return (
      <Badge
        variant="outline"
        className={
          diff > 0
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-500 bg-gray-100 text-gray-600"
        }
      >
        {diff > 0
          ? `Arrives in ${dh}h ${dm}m`
          : `Arrived ${dh}h ${dm}m ago`}
      </Badge>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Operation Events</h2>
        <button
          onClick={loadWaiting}
          disabled={loading}
          title="Refresh"
          className="p-1 hover:bg-gray-100 rounded"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : waiting.length === 0 ? (
        <p className="text-sm text-gray-500">No vessels waiting.</p>
      ) : (
        <ul className="space-y-2">
          {waiting.map(v => (
            <li
              key={v.id}
              className="flex items-center justify-between border rounded p-3"
            >
              <div>
                <Badge className="bg-yellow-50 text-yellow-700 border-yellow-500">
                  Waiting
                </Badge>
                <span className="ml-2 font-medium">{v.vessel_type}</span>
                <span className="ml-1 text-sm text-gray-600">
                  ({v.vessel_size}m)
                </span>
                <div className="mt-1">
                  <ETACountdown eta={v.eta_hour} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  title="Reschedule"
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    const newEta = prompt("Enter new ETA (HH:MM):", v.eta_hour);
                    if (newEta) {
                      reschedule(v.id, newEta);
                      loadWaiting();
                    }
                  }}
                >
                  <CalendarClock size={18} />
                </button>
                <button
                  title="Notify Agent"
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => notifyAgent(v.id)}
                >
                  <Bell size={18} />
                </button>
                <button
                  title="Bump Priority"
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    bumpPriority(v.id);
                    loadWaiting();
                  }}
                >
                  <ArrowUpDown size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
