import { useState, useEffect, useMemo } from "react";

export default function App() {

const API = import.meta.env.VITE_API_URL;

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
const [suggestedTableId, setSuggestedTableId] = useState(null);


//run once, fetch my tables
useEffect(() => {
  fetch(`${API}/api/tables`)
    .then((res) => res.json())
    .then((data) => setTables(data))
    .catch((err) => console.error(err));
}, []);


//fetch bookings on date change
useEffect(() => {
  const url = `${API}/api/bookings?date=${encodeURIComponent(selectedDate)}`;
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

const selectedTimeMs = new Date(selectedDateTimeISO).getTime();

//Styles for details
const inputStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 14
};

const statusStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: status === "booked" ? "#fee2e2" : "#e8f5e9",
  color: status === "booked" ? "#b91c1c" : "#2e7d32",
});

const buttonStyle = {
  marginTop: 10,
  padding: "8px 12px",
  borderRadius: 8,
  border: "none",
  background: "#111",
  color: "white",
  cursor: "pointer",
  fontWeight: 500
};

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

const availableTables = useMemo(() => {
  return filteredTables.filter(
    (t) => tableStatus[t.id] === "available"
  );
}, [filteredTables, tableStatus]);

//Select suggested table for highlight
useEffect(() => {
  if (availableTables.length === 0) {
    setSuggestedTableId(null);
    return;
  }

  let bestTable = null;
  let bestFreeMinutes = -1;

  for (const table of availableTables) {
    const freeMinutes = getFreeMinutes(table.id);

    if (freeMinutes >= 60) {
      setSuggestedTableId(table.id);
      return;
    }

    if (freeMinutes > bestFreeMinutes) {
      bestFreeMinutes = freeMinutes;
      bestTable = table.id;
    }
  }

  setSuggestedTableId(bestTable);
}, [availableTables, bookings, selectedDateTimeISO]);

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

const getFreeMinutes = (tableId) => {
const tableBookings = bookings
  .filter((b) => b.tableId === tableId)
  .map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }))
  .sort((a, b) => a.start - b.start);

for (const b of tableBookings) {
  if (b.start > selectedTimeMs) {
    return (b.start - selectedTimeMs) / 60000;
  }
  if (selectedTimeMs >= b.start && selectedTimeMs < b.end) {
    return 0;
  }
}

return Infinity;
};

return (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "5fr 1fr",
      height: "100vh",
    }}
  >
    {/* FLOOR PLAN */}
    <div style={{ borderRight: "1px solid #ccc" }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          x1="0"
          y1="225"
          x2="475"
          y2="225"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1="475"
          y1="225"
          x2="475"
          y2="0"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1="475"
          y1="225"
          x2="475"
          y2="450"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1="0"
          y1="450"
          x2="600"
          y2="450"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1="600"
          y1="450"
          x2="600"
          y2="0"
          stroke="#999"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        <text x="10" y="50" fontSize="40" fill="#fff">
          Floor Plan
        </text>

        <text x="10" y="200" fontSize="24" fill="#fff">
          Main hall
        </text>

        <text x="10" y="425" fontSize="24" fill="#fff">
          Terrace
        </text>

        <text x="490" y="425" fontSize="24" fill="#fff">
          VIP table
        </text>

        {tables.map((table) => {
          const visible = isTableVisible(table);
          const isHovered = hoveredTableId === table.id;
          const isSelected = selectedTableId === table.id;
          const isSuggested = table.id === suggestedTableId;

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
              stroke={
                isSelected
                  ? "#1f6feb"
                  : isSuggested
                  ? "#ffff00"
                  : "#000000"
              }
              strokeWidth={isSuggested || isSelected ? 2 : 1}
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
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div>
        <h3>Filters</h3>

        <div>
          <label>Date: </label>
          <input
            type="date"
            style={inputStyle}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div>
          <label>Time: </label>
          <input
            type="time"
            style={inputStyle}
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="partySize">Party Size:</label>
          <select
            id="partySize"
            value={partySize}
            style={inputStyle}
            onChange={(e) => setPartySize(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
        <h3>Table Details</h3>

        <div
          style={{
            display: "grid",
            gap: 8,
            minHeight: 160,
            position: "relative",
          }}
        >
          {!selectedTable && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#777",
                pointerEvents: "none",
              }}
            >
              Click a table to see details
            </div>
          )}

          <div style={infoRow}>
            <span>Seats</span>
            <b>{selectedTable ? selectedTable.seats : "-"}</b>
          </div>

          <div style={infoRow}>
            <span>Status</span>
            {selectedTable ? (
              (() => {
                const status = tableStatus[selectedTable.id] ?? "available";
                return <span style={statusStyle(status)}>{status}</span>;
              })()
            ) : (
              "-"
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              height: 80,
              overflowY: "auto",
            }}
          >
            {!selectedTable ? (
              <span style={{ fontSize: 12, color: "#777" }}>
                No table selected
              </span>
            ) : selectedTableBookings.length === 0 ? (
              <span style={{ fontSize: 12, color: "#777" }}>
                No bookings
              </span>
            ) : (
              selectedTableBookings.map((b, i) => (
                <div
                  key={`${b.tableId}-${b.start}-${i}`}
                  style={{
                    background: "#441e1e",
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {b.start.slice(11, 16)} – {b.end.slice(11, 16)}
                </div>
              ))
            )}
          </div>

          <button
            style={buttonStyle}
            disabled={!selectedTable}
            onClick={() => setSelectedTableId(null)}
          >
            Clear selection
          </button>
        </div>
      </div>
    </div>
  </div>
);}