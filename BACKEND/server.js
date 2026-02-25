import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ===============================
   🔑 API KEY
================================ */
const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjdjY2YwMzMzZDJhNTQyOTZiMWFjYzU5MjBiYjVkZDMzIiwiaCI6Im11cm11cjY0In0=";

/* ===============================
   📍 CAMPUS COORDINATES
================================ */

const campuses = {
  "Campus 1": { lat: 20.346680, lon: 85.823436 },
  "Campus 2": { lat: 20.353326, lon: 85.819614 },
  "Campus 3": { lat: 20.353878, lon: 85.816555 },
  "Campus 4": { lat: 20.354497, lon: 85.819486 },
  "Campus 5": { lat: 20.353005, lon: 85.814005 },
  "Campus 6": { lat: 20.353318, lon: 85.819344 },
  "Campus 7": { lat: 20.351021, lon: 85.819503 },
  "Campus 12": { lat: 20.355488, lon: 85.820566 },
  "Campus 15": { lat: 20.349061, lon: 85.815054 },
  "Campus 25": { lat: 20.364584, lon: 85.816897 }
};

/* ===============================
   🚀 ROUTE API
================================ */

app.post("/route", async (req, res) => {
  const { campus1, campus2, mode } = req.body;

  if (!campus1 || !campus2) {
    return res.status(400).json({ error: "Campus names required" });
  }

  const c1 = campuses[campus1];
  const c2 = campuses[campus2];

  if (!c1 || !c2) {
    return res.status(400).json({ error: "Invalid campus selected" });
  }

  let profile = "driving-car";
  if (mode === "bike") profile = "cycling-regular";
  if (mode === "walk") profile = "foot-walking";

  try {
    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${profile}`,
      {
        coordinates: [
          [c1.lon, c1.lat],
          [c2.lon, c2.lat]
        ]
      },
      {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const route = response.data.routes[0];
    const summary = route.summary;
    const segment = route.segments[0];

    res.json({
      distance: (summary.distance / 1000).toFixed(2),
      duration: (summary.duration / 60).toFixed(1),
      geometry: route.geometry,
      steps: segment.steps.map(step => ({
        instruction: step.instruction,
        distance: (step.distance / 1000).toFixed(2),
        duration: (step.duration / 60).toFixed(1)
      }))
    });

  } catch (error) {
    console.error("Route API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch route" });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;