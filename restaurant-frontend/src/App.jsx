import { useEffect, useState } from "react";

function App() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/tables")
      .then(res => res.json())
      .then(data => setTables(data));
  }, []);

  return (
    <div>
      <h1>Tables</h1>
      <pre>{JSON.stringify(tables, null, 2)}</pre>
    </div>
  );
}

export default App;
