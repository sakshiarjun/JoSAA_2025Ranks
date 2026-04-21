import { useState, useEffect } from "react";
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
  const [allInstitutes, setAllInstitutes] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [allProgramsGlobal, setAllProgramsGlobal] = useState([]);
  const [branchSuggestions, setBranchSuggestions] = useState([]);

  const fetchInstituteData = async () => {
    if (!instName || !progName) {
      alert("Select institute and program");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        // `http://localhost:5050/institute_cutoffs?institute=${instName}&program=${progName}`
         `https://josaa-2025ranks.onrender.com/institute_cutoffs?institute=${instName}&program=${progName}`
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

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await axios.get(
          // "http://localhost:5050/institutes"
          "https://josaa-2025ranks.onrender.com/institutes"
        );
        setAllInstitutes(res.data);
      } catch (err) {
        console.error("Error fetching institutes:", err);
      }
    };

    fetchInstitutes();
  }, []);

  useEffect(() => {
    const fetchAllPrograms = async () => {
      try {
        const res = await axios.get(
          // "http://localhost:5050/all_programs"
          "https://josaa-2025ranks.onrender.com/all_programs"
        );
        setAllProgramsGlobal(res.data);
      } catch (err) {
        console.error("Error fetching all programs:", err);
      }
    };

    fetchAllPrograms();
  }, []);

  const fetchPrograms = async (institute) => {
    try {
      const res = await axios.get(
        // `http://localhost:5050/programs?institute=${institute}`
        `https://josaa-2025ranks.onrender.com/programs?institute=${institute}`
      );
      setAllPrograms(res.data);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    alert("Fetching data... This may take a few seconds.");
    try {
      const res = await axios.get(
         `https://josaa-2025ranks.onrender.com/predict?rank=${rank}&category=${category}&round=${round}`
         // `http://localhost:5050/predict?rank=${rank}&category=${category}&round=${round}`
      );
      
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

  const handleInstituteChange = (value) => {
    setInstName(value);

    if (!value) {
      setInstSuggestions(allInstitutes); // show default list
      return;
    }

    const filtered = allInstitutes.filter(inst =>
      inst.toLowerCase().includes(value.toLowerCase())
    );

    setInstSuggestions(filtered); // limit suggestions
    //console.log("Institute Suggestions:", filtered.slice(0, 5)); // Debug: log suggestions
  };

  const handleProgramChange = (value) => {
    setProgName(value);

    if (!value) {
      setProgSuggestions(allPrograms); // show default list
      return;
    }

    const filtered = allPrograms.filter(prog =>
      prog.toLowerCase().includes(value.toLowerCase())
    );

    setProgSuggestions(filtered);
    //console.log("Program Suggestions:", filtered.slice(0, 5)); // Debug: log suggestions
  };

  const handleBranchChange = (value) => {
  setBranch(value);

  if (!value) {
    setBranchSuggestions(allProgramsGlobal.slice(0, 10));
    return;
  }

  const filtered = allProgramsGlobal.filter(prog =>
    prog.toLowerCase().includes(value.toLowerCase())
  );

  setBranchSuggestions(filtered.slice(0, 10));
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
        <p> Enter your rank, category, and round to see predicted options. Displays all options where your rank is below the cutoff range.</p>
        <p> Then you can filter by program.</p>
        <p> If you want to search for an Institute, refresh the page and then go to 'Search Cutoff by Institute'.</p>
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

          <div className="autocomplete">
            <input
              type="text"
              placeholder="Filter Program (e.g. Computer Science)"
              value={branch}
              onChange={(e) => handleBranchChange(e.target.value)}
              onFocus={() => setBranchSuggestions(allProgramsGlobal.slice(0, 10))}
              onBlur={() => setTimeout(() => setBranchSuggestions([]), 150)}
            />

  {branchSuggestions.length > 0 && (
    <ul className="dropdown">
      {branchSuggestions.map((prog, i) => (
        <li
          key={i}
          onMouseDown={() => {
            setBranch(prog);
            setBranchSuggestions([]);
          }}
        >
          {prog}
        </li>
      ))}
    </ul>
  )}
</div>

          <button onClick={fetchData}>Search</button>
        </div>
        <p>🔴 Dream Options (Reach)</p>
        <p>🟡 Moderate Options (Consider)</p>
        <p>🟢 Safe Options (Definite)</p>

        {loading && <p>Loading...</p>}
        {showResults && (
          <>
            {/* All results */}
            <Table data={results} />
          </>
        )}
      </div>

      {/* Search by Institute Card */}
      <div className="card">
        <h2>Search Cutoff by Institute</h2>
        <p> Enter Institute Name and Program to see cutoff details.</p>
        <p> If you don't see your institute, try a different spelling or scroll down.</p>
        <p> Programs are filtered based on the selected institute, so select an institute first.</p>
        <div className="filters">
          <div className="autocomplete">
            <input
              type="text"
              placeholder="Enter Institute (e.g. National Institute of Technology Tiruchirappalli)"
              value={instName}
              onChange={(e) => handleInstituteChange(e.target.value)}
              onFocus={() => setInstSuggestions(allInstitutes)}
              onBlur={() => {
              // delay so click can register
              setTimeout(() => setInstSuggestions([]), 150);
              }}
            />
            {instSuggestions.length > 0 && (
            <ul className="dropdown">
              {instSuggestions.map((inst, i) => (
              <li
                key={i}
                onMouseDown={() => {   // 🔥 important fix
                setInstName(inst);
                setInstSuggestions([]);
                setProgName("");     // reset program
                fetchPrograms(inst); // fetch programs for selected institute
              }}>
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
              onFocus={() => setProgSuggestions(allPrograms)}
              onBlur={() => {
                // delay so click can register
                setTimeout(() => setProgSuggestions([]), 150);
              }}
              disabled={!instName}
            />

            {progSuggestions.length > 0 && (
              <ul className="dropdown">
                {progSuggestions.map((prog, i) => (
                  <li
                    key={i}
                    onMouseDown={() => {   // 🔥 important fix
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