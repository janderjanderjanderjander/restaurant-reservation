import { useState, useEffect, useMemo } from "react";

export default function App() {

//Time now in utc
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
const [selectedTime, setSelectedTime] = useState(now.toISOString().slice(11, 16));
const [partySize, setPartySize] = useState(2);
const [showAvailableOnly, setShowAvailableOnly] = useState(false);
const [tables, setTables] = useState([]);
const [hoveredTableId, setHoveredTableId] = useState(null);
const [selectedTableId, setSelectedTableId] = useState(null);
const [bookings, setBookings] = useState([]);

//run once, fetch my tables
  useEffect(() => {
    fetch("http://localhost:8080/api/tables")
      .then((res) => res.json())
      .then((data) => setTables(data))
      .catch((err) => console.error(err));
  }, []);

//fetch bookings on date change
  useEffect(() => {
    //compose url
    const url = `http://localhost:8080/api/bookings?date=${encodeURIComponent(selectedDate)}`;
  //fetch it now
  fetch(url)
    .then((res) => res.json())
    .then(setBookings)
    .catch(console.error)
  }, [selectedDate]);

//helper function to see availability
  const isItBooked = (selectedISO, startISO, endISO) => {
    const t = new Date(selectedISO).getTime();
    const s = new Date(startISO).getTime();
    const e = new Date(endISO).getTime();
    return t >= s && t < e; //is the time after start but before end
  }

//Need iso form to check avaialbility
//Quick help from chatGPT
  const selectedDateTimeISO = useMemo(() => {
    return `${selectedDate}T${selectedTime}:00`;
  }, [selectedDate, selectedTime]);

//Is it booked?
  const tableStatus = useMemo(() => {
    const map = {};
    for (const t of tables) map[t.id] = "available";
    for (const b of bookings) {
      if (isItBooked(selectedDateTimeISO, b.start, b.end)) {
        map[b.tableId] = "booked";
      }
    }
    return map
  }, [tables, bookings, selectedDateTimeISO]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      if (t.seats < partySize) return false;
      const status = tableStatus[t.id] ?? "available";
      if (showAvailableOnly && status !== "available") return false;
      return true;
    });
  }, [tables, partySize, showAvailableOnly, tableStatus]);

  const selectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) ?? null;
  }, [tables, selectedTableId]);

  //List of bookings
  const selectedTableBookings = useMemo(() => {
    if (!selectedTableId) return [];
    return bookings
      .filter((b) => b.tableId === selectedTableId)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [bookings, selectedTableId]);

  

  const isTableVisible = (table) => filteredTables.some((t) => t.id === table.id);

  const baseFillFor = (table, visible) => {
    if (!visible) return "#ddd";
    const status = tableStatus[table.id] ?? "available";
    return status === "available" ? "green" : "red";
  };

  const hoverFillFor = (table, visible) => {
    if (!visible) return "#cfcfcf";
    const status = tableStatus[table.id] ?? "available";
    return status === "available" ? "#0a8f0a" : "#b00000";
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3fr 1fr",
        height: "100vh",
      }}
    >
      {/* FLOOR PLAN */}
      <div style={{ borderRight: "1px solid #ccc" }}>
        <svg width="100%" height="100%">
          {tables.map((table) => {
            const visible = isTableVisible(table);
            const isHovered = hoveredTableId === table.id;
            const isSelected = selectedTableId === table.id;

            const fill = isHovered
              ? hoverFillFor(table, visible)
              : baseFillFor(table, visible);

            return (
              <rect
                key={table.id}
                x={table.x}
                y={table.y}
                width="60"
                height="60"
                rx="8"
                ry="8"
                fill={fill}
                stroke={isSelected ? "#1f6feb" : "black"}
                strokeWidth={isSelected ? 4 : 1}
                style={{
                  cursor: visible ? "pointer" : "not-allowed",
                  transition: "fill 120ms ease, stroke-width 120ms ease",
                  opacity: visible ? 1 : 0.6,
                }}
                onMouseEnter={() => setHoveredTableId(table.id)}
                onMouseLeave={() => setHoveredTableId(null)}
                onClick={() => {
                  if (!visible) return;
                  setSelectedTableId(table.id);
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* SIDEBAR */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h3>Filters</h3>

          <div>
            <label>Date: </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label>Time: </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          <div>
            <label>Party Size: {partySize}</label>
            <input
              type="range"
              min="1"
              max="8"
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label>
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
              />{" "}
              Show available only
            </label>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
          <h3>Table Details</h3>

          {!selectedTable ? (
            <div style={{ color: "#666" }}>Click a table to see details.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>ID:</b> {selectedTable.id}</div>
              <div><b>Seats:</b> {selectedTable.seats}</div>
              <div><b>Status:</b> {tableStatus[selectedTable.id] ?? "available"}</div>
              <div><b>Position:</b> ({selectedTable.x}, {selectedTable.y})</div>
              <div style={{ marginTop: 12 }}>
                <b>Bookings on {selectedDate}:</b>

                {selectedTableBookings.length === 0 ? (
                  <div style={{ color: "#666" }}>No bookings.</div>
                ) : (
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {selectedTableBookings.map((b, i) => (
                      <li key={`${b.tableId}-${b.start}-${i}`}>
                        {b.start.slice(11, 16)} – {b.end.slice(11, 16)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>


              <button
                onClick={() => setSelectedTableId(null)}
                style={{ marginTop: 8 }}
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}