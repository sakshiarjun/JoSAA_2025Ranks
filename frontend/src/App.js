import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [round, setRound] = useState("6");
  const [branch, setBranch] = useState("");
  const [results, setResults] = useState([]);

  const fetchData = async () => {
    alert("Fetching data... This may take a few seconds.");
    try {
      const res = await axios.get(
        `https://josaa-2025ranks.onrender.com/predict?rank=${rank}&category=${category}&round=${round}`
      );

      let data = res.data;

      // 🔍 Branch filter
      if (branch) {
        data = data.filter(d =>
          d["Program"].toLowerCase().includes(branch.toLowerCase())
        );
      }

      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    }
  };

  // 🎯 Top recommendations logic
  const safe = results.filter(r => r.chance === "Safe").slice(0, 5);
  const moderate = results.filter(r => r.chance === "Moderate").slice(0, 5);
  const dream = results.filter(r => r.chance === "Dream").slice(0, 5);

  return (
    <div className="container">
      <h1>JoSAA Predictor</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="number"
          placeholder="Enter Rank"
          value={rank}
          onChange={(e) => setRank(e.target.value)}
        />

        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="OPEN">OPEN</option>
          <option value="OBC-NCL">OBC-NCL</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="EWS">EWS</option>
        </select>

        <select onChange={(e) => setRound(e.target.value)}>
          {[1,2,3,4,5,6].map(r => (
            <option key={r} value={r}>Round {r}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search Branch (e.g. CSE)"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />

        <button onClick={fetchData}>Predict</button>
      </div>

      {/* Recommendations */}
      <Section title="🟢 Safe Options" data={safe} />
      <Section title="🟡 Moderate Options" data={moderate} />
      <Section title="🔴 Dream Options" data={dream} />

      {/* All results */}
      <h2>All Results</h2>
      <div className="grid">
        {results.map((r, i) => (
          <Card key={i} data={r} />
        ))}
      </div>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <>
      <h2>{title}</h2>
      <div className="grid">
        {data.map((r, i) => (
          <Card key={i} data={r} />
        ))}
      </div>
    </>
  );
}

function Card({ data }) {
  return (
    <div className="card">
      <h3>{data["Institute"]}</h3>
      <p>{data["Program"]}</p>
      <p><b>Quota:</b> {data["Quota"]}</p>
      <p><b>Closing Rank:</b> {data["Closing Rank"]}</p>
      <span className={`badge ${data.chance.toLowerCase()}`}>
        {data.chance}
      </span>
    </div>
  );
}

export default App;