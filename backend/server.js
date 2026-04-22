const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("Loading data...");
const data = require("./josaa_all.json");
console.log("Data loaded:", data.length, "records");

// Helper: classify chances
function classify(rank, closing) {
  const ratio = rank / closing;

  if (ratio < 0.6) return "Safe";
  if (ratio < 0.9) return "Moderate";
  return "Dream";
}

// API
app.get("/", (req, res) => {
  res.send("API is working");
});

app.get("/institutes", (req, res) => {
  const institutes = [...new Set(data.map(d => d["Institute"]))];
  res.json(institutes.sort());
});

app.get("/programs", (req, res) => {
  const institute = req.query.institute;

  if (!institute) {
    return res.status(400).json({ error: "Institute required" });
  }

  const programs = [
    ...new Set(
      data
        .filter(d => d["Institute"] === institute)
        .map(d => d["Program"])
    )
  ];

  res.json(programs.sort());
});

app.get("/all_programs", (req, res) => {
  const programs = [...new Set(data.map(d => d["Program"]))];
  res.json(programs.sort());
});


app.get("/predict", (req, res) => {
  const rank = parseInt(req.query.rank);
  const category = req.query.category;
  const round = req.query.round ? parseInt(req.query.round) : null;
  const gender = req.query.gender || null;

  let result = data.filter(d =>
    d["Seat Type"] === category &&
    d["Closing Rank"] >= rank
  );

  // Optional round filter
  if (round) {
    result = result.filter(d => d["Round"] === round);
  }

  // Optional gender filter (loose match)
  if (gender) {
    result = result.filter(d =>
      d["Gender"].toLowerCase().includes(gender.toLowerCase())
    );
  }

  // Add prediction label
  result = result.map(d => ({
    ...d,
    chance: classify(rank, d["Closing Rank"])
  }));

  // Sort by closing rank (ascending = better colleges first)
  result.sort((a, b) => a["Closing Rank"] - b["Closing Rank"]);

  res.json(result); 
});

app.get("/institute_cutoffs", (req, res) => {
  const institute = req.query.institute;
  const program = req.query.program;
  const category = req.query.category;
  const gender = req.query.gender || null;

  if (!institute || !program) {
    return res.status(400).json({ error: "Institute and Program required" });
  }

  let result = data.filter(d =>
    d["Institute"].toLowerCase().includes(institute.toLowerCase()) &&
    d["Program"].toLowerCase().includes(program.toLowerCase())
  );

  // Category filter
  if (category) {
    result = result.filter(d => d["Seat Type"] === category);
  }

  // Gender filter (optional)
  if (gender) {
    result = result.filter(d =>
      d["Gender"].toLowerCase().includes(gender.toLowerCase())
    );
  }

  // 🧠 Group by round (important for your feature)
  result = result.map(d => ({
    "Institute": d["Institute"],
    "Program": d["Program"],
    "Round": d["Round"],
    "Quota": d["Quota"],
    "Seat Type": d["Seat Type"],
    "Gender": d["Gender"],
    "Opening Rank": d["Opening Rank"],
    "Closing Rank": d["Closing Rank"]
  }));
  //console.log("Filtered cutoffs:", result.length, "records", result.slice(0, 3)); // debug log

  // Sort by round (1 → 6)
  result.sort((a, b) => a["Round"] - b["Round"]);

  res.json(result);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {}, 1000);