import React, { useEffect, useState } from "react";
import { VesselInputForm } from "./VesselInputForm";
import { BerthMap } from "./BerthMap";
import { OperationEvents } from "./OperationEvents";

export default function Dashboard() {
  const [vessels, setVessels] = useState([]);
  const [status, setStatus] = useState("loading");

  // ——— DEMO CLOCK & DEPARTURE LOGIC ———
  const [simTime, setSimTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(
      () => setSimTime(t => t + 5 * 60 * 1000),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  const handleDepart = departedId => {
    setVessels(all =>
      all.map(v =>
        v.id === departedId ? { ...v, berth_id: null } : v
      )
    );
    setTimeout(() => {
      setVessels(all => {
        const departed = all.find(v => v.id === departedId);
        if (!departed) return all;
        const nextIdx = all.findIndex(
          v => !v.berth_id && v.vessel_type === departed.vessel_type
        );
        if (nextIdx === -1) return all;
        const updated = [...all];
        updated[nextIdx] = {
          ...updated[nextIdx],
          berth_id: departed.berth_id
        };
        return updated;
      });
    }, 2000);
  };
  // ————————————————————————————————

  const fetchVessels = () => {
    fetch("http://localhost:5000/api/vesselEvent")
      .then(res => {
        if (!res.ok) throw new Error("API not responding");
        return res.json();
      })
      .then(data => {
        setVessels(data);
        setStatus("connected");
      })
      .catch(err => {
        console.error("Connection error:", err);
        setStatus("error");
      });
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleVesselSubmit = data => {
    fetch("http://localhost:5000/api/vesselEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to submit vessel");
        return res.json();
      })
      .then(() => {
        alert("✅ Vessel submitted successfully!");
        fetchVessels();
      })
      .catch(err => {
        console.error(err);
        alert("❌ Error submitting vessel.");
      });
  };

  // Action callbacks for <OperationEvents>
  const notifyAgent = id => {
    fetch(`/api/notify/${id}`, { method: "POST" })
      .then(() => alert(`Agent notified for vessel ${id}`))
      .catch(() => alert("Failed to notify agent."));
  };
  const reschedule = (id, newEta) => {
    fetch(`/api/vesselEvent/${id}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eta_hour: newEta }),
    })
      .then(() => fetchVessels())
      .catch(() => alert("Failed to reschedule."));
  };
  const bumpPriority = id => {
    fetch(`/api/vesselEvent/${id}/bump`, { method: "POST" })
      .then(() => alert(`Vessel ${id} bumped to front of queue`))
      .catch(() => alert("Failed to bump priority."));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      {/* Add New Vessel */}
      <div className="mb-8 border p-4 rounded-lg shadow bg-white">
        <h2 className="text-lg font-semibold mb-2">Add New Vessel</h2>
        <VesselInputForm onSubmit={handleVesselSubmit} />
      </div>

      {/* Process Waiting Queue */}
      {status === "connected" && (
        <button
          onClick={() => {
            fetch("http://localhost:5000/api/vesselEvent/assign", { method: "POST" })
              .then(res => res.text())
              .then(msg => {
                alert(msg);
                fetchVessels();
              });
          }}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🚀 Process Waiting Queue
        </button>
      )}

      {/* Status Messages */}
      {status === "loading" && <p>🔄 Connecting to backend...</p>}
      {status === "error" && <p className="text-red-500">❌ Could not connect to backend.</p>}

      {status === "connected" && (
        <>
          {/* Berth Map */}
          <div className="mb-8 border p-4 rounded-lg shadow bg-white">
            <BerthMap vessels={vessels} simTime={simTime} onDepart={handleDepart} />
          </div>

          {/* Port Utilization */}
          <div className="mb-8 border p-4 rounded-lg shadow bg-white">
            <h2 className="text-lg font-semibold mb-2">Port Utilization</h2>
            {(() => {
              const berthMap = { A: "Tanker", B: "Container", C: "Bulk", D: "RoRo" };
              const totalBerths = Object.keys(berthMap).length;
              const occupiedBerths = new Set(
                vessels.filter(v => v.berth_id).map(v => v.berth_id)
              );
              const occupied = occupiedBerths.size;
              const available = totalBerths - occupied;
              const scheduledToday = vessels.length;
              const utilization = ((occupied / totalBerths) * 100).toFixed(0);

              return (
                <>
                  <div className="w-full bg-gray-200 h-3 rounded-full mb-3">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white p-2 rounded border">Total Berths: {totalBerths}</div>
                    <div className="bg-white p-2 rounded border">Occupied: {occupied}</div>
                    <div className="bg-white p-2 rounded border">Available: {available}</div>
                    <div className="bg-white p-2 rounded border">Scheduled Today: {scheduledToday}</div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Operation Events (Waiting Queue) */}
          <div className="mb-8">
            <OperationEvents
              vessels={vessels}
              notifyAgent={notifyAgent}
              reschedule={reschedule}
              bumpPriority={bumpPriority}
            />
          </div>
        </>
      )}
    </div>
  );
}
