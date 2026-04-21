import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [instName, setInstName] = useState("");
  const [progName, setProgName] = useState("");
  const [instSuggestions, setInstSuggestions] = useState([]);
  const [progSuggestions, setProgSuggestions] = useState([]);
  const [instResults, setInstResults] = useState([]);
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [round, setRound] = useState("6");
  const [branch, setBranch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false); // State to control visibility
  const [showInstResults, setShowInstResults] = useState(false); // State to control visibility for institute results
  const [genderFilter, setGenderFilter] = useState(""); // State for Gender filter
  const [seatTypeFilter, setSeatTypeFilter] = useState(""); // State for Seat Type filter
  const [hideHomeState, setHideHomeState] = useState(false); // State for Hide Home State Data filter

  const fetchInstituteData = async () => {
    if (!instName || !progName) {
      alert("Select institute and program");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5050/institute_cutoffs?institute=${instName}&program=${progName}`
      );

      let data = res.data;
      //console.log("Fetched Institute Data:", data.slice(0, 10)); // Debug: log first 10 records

      // Apply Gender filter
      if (genderFilter) {
        data = data.filter(d => d["Gender"] === genderFilter);
      }

      // Apply Seat Type filter
      if (seatTypeFilter) {
        data = data.filter(d => d["Seat Type"] === seatTypeFilter);
      }

      setInstResults(data);
      //console.log("Institute Results:", data.slice(0, 10)); // Debug: log first 10 results
      setShowInstResults(true); // Show results after fetching data
    } catch (err) {
      console.error(err);
      alert("Error fetching institute data");
    }

    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    alert("Fetching data... This may take a few seconds.");
    try {
      const res = await axios.get(
        `http://localhost:5050/predict?rank=${rank}&category=${category}&round=${round}`
      );
      // https://josaa-2025ranks.onrender.com/predict?rank=${rank}&category=${category}&round=${round}
      // http://localhost:5050/predict?rank=${rank}&category=${category}&round=${round}
      let data = res.data;

      // 🔍 Branch filter
      if (branch) {
        data = data.filter(d =>
          d["Program"].toLowerCase().includes(branch.toLowerCase())
        );
      }

      setResults(data);
      console.log("Updated Results:", data.slice(0, 10)); // Debug: log first 10 results
      setShowResults(true); // Show results after fetching data
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    }
    setLoading(false);
  };

  // 🎯 Top recommendations logic
  const safe = results.filter(r => r.chance === "Safe").slice(0, 5);
  const moderate = results.filter(r => r.chance === "Moderate").slice(0, 5);
  const dream = results.filter(r => r.chance === "Dream").slice(0, 5);

  const allInstitutes = [...new Set(results.map(r => r["Institute"]))];
  //console.log("All Institutes:", allInstitutes.slice(0, 10)); // Debug: log first 10 institutes

  const allPrograms = [
    ...new Set(
      results
        .filter(r => r["Institute"] === instName)
        .map(r => r["Program"])
    )
  ];

  const handleInstituteChange = (value) => {
    setInstName(value);

    if (!value) {
      setInstSuggestions([]);
      return;
    }

    const filtered = allInstitutes.filter(inst =>
      inst.toLowerCase().includes(value.toLowerCase())
    );

    setInstSuggestions(filtered.slice(0, 5)); // limit suggestions
  };

  const handleProgramChange = (value) => {
    setProgName(value);

    if (!value) {
      setProgSuggestions([]);
      return;
    }

    const filtered = allPrograms.filter(prog =>
      prog.toLowerCase().includes(value.toLowerCase())
    );

    setProgSuggestions(filtered.slice(0, 5));
  };

  return (
    <div className="container">
      <h1>JoSAA Predictor</h1>
      <h3>
        Based on 2025 cutoffs
      </h3>

      {/* Search by Rank Card */}
      <div className="card">
        <h2>Search by Rank</h2>
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
            placeholder="Filter Branch (e.g. Computer Science and Engineering)"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />

          <button onClick={fetchData}>Search</button>
        </div>

        {showResults && (
          <>
            {/* Recommendations */}
            <Section title="🔴 Dream Options (Reach)" data={dream} />
            <Section title="🟡 Moderate Options (Consider)" data={moderate} />
            <Section title="🟢 Safe Options (Definite)" data={safe} />

            {/* All results */}
            <h2>All Results</h2>
            <Table data={results} />
          </>
        )}
      </div>

      {/* Search by Institute Card */}
      <div className="card">
        <h2>Search Cutoff by Institute</h2>
        <div className="filters">
          <div className="autocomplete">
            <input
              type="text"
              placeholder="Enter Institute"
              value={instName}
              onChange={(e) => handleInstituteChange(e.target.value)}
            />

            {instSuggestions.length > 0 && (
              <ul className="dropdown">
                {instSuggestions.map((inst, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setInstName(inst);
                      setInstSuggestions([]);
                    }}
                  >
                    {inst}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="autocomplete">
            <input
              type="text"
              placeholder="Enter Program"
              value={progName}
              onChange={(e) => handleProgramChange(e.target.value)}
              disabled={!instName}
            />

            {progSuggestions.length > 0 && (
              <ul className="dropdown">
                {progSuggestions.map((prog, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setProgName(prog);
                      setProgSuggestions([]);
                    }}
                  >
                    {prog}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Gender Filter */}
          <select onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Gender-Neutral">Gender-Neutral</option>
            <option value="Female-only (including Supernumerary)">Female-only (including Supernumerary)</option>
          </select>

          {/* Seat Type Filter */}
          <select onChange={(e) => setSeatTypeFilter(e.target.value)}>
            <option value="">Select Seat Type</option>
            <option value="OPEN">OPEN</option>
            <option value="OBC-NCL">OBC-NCL</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>

          {/* Hide Home State Data Filter */}
          <label>
            <input
              type="checkbox"
              onChange={(e) => setHideHomeState(e.target.checked)}
            />
            Hide Home State Data
          </label>

          <button onClick={fetchInstituteData}>
            Search Institute
          </button>
        </div>

        {showInstResults && (
          <>
            {/* Institute search results */}
            <h2>Institute Cutoffs (All Rounds)</h2>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Institute</th>
                  <th>Program</th>
                  <th>Round</th>
                  <th>Seat Type</th>
                  <th>Quota</th>
                  <th>Gender</th>
                  <th>Opening Rank</th>
                  <th>Closing Rank</th>
                </tr>
              </thead>
              <tbody>
                {instResults
                  .filter(row => !hideHomeState || row["Quota"] === "OS")
                  .map((row, index) => (
                    <tr key={index}>
                      <td>{row["Institute"]}</td>
                      <td>{row["Program"]}</td>
                      <td>{row["Round"]}</td>
                      <td>{row["Seat Type"]}</td>
                      <td>{row["Quota"]}</td>
                      <td>{row["Gender"]}</td>
                      <td>{row["Opening Rank"]}</td>
                      <td>{row["Closing Rank"]}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <>
      <h2>{title}</h2>
      <Table data={data} />
    </>
  );
}

function Table({ data }) {
  return (
    <table className="results-table">
      <thead>
        <tr>
          <th>Institute</th>
          <th>Program</th>
          <th>Quota</th>
          <th>Closing Rank</th>
          <th>Chance</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row["Institute"]}</td>
            <td>{row["Program"]}</td>
            <td>{row["Quota"]}</td>
            <td>{row["Closing Rank"]}</td>
            <td>
              <span className={`badge ${row.chance.toLowerCase()}`}>
                {row.chance}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default App;