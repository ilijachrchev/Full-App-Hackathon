import React, { useState } from "react";

export function VesselInputForm({ onSubmit }) {
  const [vesselType, setVesselType] = useState("");
  const [subtype, setSubtype] = useState(null);
  const [vesselSize, setVesselSize] = useState(50);
  const [etaHour, setEtaHour] = useState("08:00");
  const [departureHour, setDepartureHour] = useState("12:00");

  const handleTypeChange = (e) => {
    const selected = e.target.value;
    setVesselType(selected);
    if (selected !== "Container") {
      setSubtype(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      vessel_type: vesselType,
      vessel_size: parseInt(vesselSize),
      eta_hour: etaHour,
      planned_departure_hour: departureHour,
      container_subtype: vesselType === "Container" ? subtype : null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-md shadow-md">
      <div>
        <label htmlFor="vesselType" className="block text-sm font-medium">Vessel Type</label>
        <select
          id="vesselType"
          value={vesselType}
          onChange={handleTypeChange}
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="">-- Select --</option>
          <option value="Container">Container</option>
          <option value="Tanker">Tanker</option>
          <option value="Bulk">Bulk</option>
          <option value="RoRo">RoRo</option>
        </select>
      </div>

      {vesselType === "Container" && (
        <div>
          <label htmlFor="containerSubtype" className="block text-sm font-medium">Container Subtype</label>
          <select
            id="containerSubtype"
            value={subtype || ""}
            onChange={(e) => setSubtype(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="">-- Select Subtype --</option>
            <option value="LongExpiryDate">LongExpiryDate</option>
            <option value="ShortExpiryDate">ShortExpiryDate</option>
            <option value="Others">Others</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="vesselSize" className="block text-sm font-medium">Vessel Size (m)</label>
        <select
          id="vesselSize"
          value={vesselSize}
          onChange={(e) => setVesselSize(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="50">50</option>
          <option value="75">75</option>
          <option value="100">100</option>
          <option value="150">150</option>
        </select>
      </div>

      <div>
        <label htmlFor="etaHour" className="block text-sm font-medium">ETA (Hour)</label>
        <input
          id="etaHour"
          type="time"
          value={etaHour}
          onChange={(e) => setEtaHour(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label htmlFor="departureHour" className="block text-sm font-medium">Planned Departure (Hour)</label>
        <input
          id="departureHour"
          type="time"
          value={departureHour}
          onChange={(e) => setDepartureHour(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Submit Vessel
      </button>

      {vesselType && (
        <div className="text-sm text-gray-600 mt-2">
          Selected: <strong>{vesselType}{vesselType === "Container" && subtype ? ` (${subtype})` : ""}</strong>
        </div>
      )}
    </form>
  );
}
