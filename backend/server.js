const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("Loading data...");
const data = require("./josaa.json");
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

  res.json(result.slice(0, 100)); // limit for performance
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {}, 1000);