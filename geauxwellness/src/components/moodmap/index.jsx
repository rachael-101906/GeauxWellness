import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "mapbox-gl/dist/mapbox-gl.css";

// ===== FIXED MAPBOX TOKEN ============
mapboxgl.accessToken =
  import.meta.env.VITE_MAPBOX_TOKEN ??
  "pk.eyJ1IjoicmJlcmdlcm9uIiwiYSI6ImNtbjB1MWNmODBsdXQycXE0NnJ3eHczYWQifQ.hDACvJteDz9IarKHxlTuXw";

// ===== LSU CAMPUS CENTER ============
const LSU_CENTER = [-91.1801, 30.4133];

// ===== Mood Colors ============
const MOOD_COLORS = {
  happy: "#FCE365",
  anxious: "#4D4C4C",
  sad: "#041375",
  angry: "#520202",
  hungry: "#FF7C02",
  flirty: "#BD0243",
};

export default function MoodHeatmap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [filter, setFilter] = useState("all");
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hello
  const HALF_LIFE_HOURS = 8;

  // =====================================================================================
  // 1. FETCH MOOD DATA FROM FIRESTORE
  // =====================================================================================
  useEffect(() => {
    fetchMoods();
  }, [filter]);

  const fetchMoods = async () => {
    setLoading(true);

    try {
      let q;
      if (filter === "all") {
        q = query(collection(db, "moods"), where("location", "!=", null));
      } else {
        q = query(
          collection(db, "moods"),
          where("mood", "==", filter),
          where("location", "!=", null)
        );
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMoods(data);
    } catch (err) {
      console.error("Error fetching moods:", err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================================
  // 2. INITIALIZE MAP ON LOAD
  // =====================================================================================
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: LSU_CENTER,
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      // Create moods geojson source
      map.current.addSource("moods", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        coordinates: [m.location.longitude, m.location.latitude],
      });

      // =================================================================================
      // Weather-style HEATMAP layer
      // =================================================================================
      map.current.addLayer({
        id: "mood-heatmap",
        type: "heatmap",
        source: "moods",
        maxzoom: 17,
        paint: {
          "heatmap-weight": [
  "interpolate", ["linear"], ["get", "moodScore"],
  0, 0,
  1, 0.5,
  3, 1,
  5, 2
],

"heatmap-intensity": [
  "interpolate", ["linear"], ["zoom"],
  13, 1.0,
  15, 2.0,
  17, 3.5
],

"heatmap-color": [
  "interpolate",
  ["linear"],
  ["heatmap-density"],

  0.00, "rgba(0,0,0,0)",
  0.05, "rgba(90, 60, 140, 0.35)",   // faint purple
  0.15, "rgba(150, 100, 200, 0.55)", // lavender
  0.30, "rgba(255, 120, 140, 0.7)",  // warm pink
  0.50, "rgba(255, 165, 80, 0.85)",  // orange
  0.75, "rgba(255, 200, 40, 0.95)",  // warm yellow
  1.00, "rgba(255, 235, 0, 1.0)"     // bright radar yellow
],

"heatmap-radius": [
  "interpolate", ["linear"], ["zoom"],
  13, 25,
  15, 40,
  17, 70
],

"heatmap-opacity": [
  "interpolate", ["linear"], ["zoom"],
  13, 0.9,
  17, 0.2
]
        }
      });

      // =================================================================================
      // CIRCLE LAYER (at closer zooms)
      // =================================================================================
      map.current.addLayer({
        id: "mood-circles",
        type: "circle",
        source: "moods",
        minzoom: 15,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            15, 4,
            17, 14
          ],
          "circle-color": [
            "match", ["get", "mood"],
            "happy", "#FFD700",
            "anxious", "#FF8C00",
            "sad", "#4169E1",
            "angry", "#FF4500",
            "hungry", "#32CD32",
            "flirty", "#FF69B4",
            "#040404"
          ],
          "circle-opacity": [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            16, 0.9
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(5, 4, 4, 0.3)"
        }
      });
    });
  }, []);

  // =====================================================================================
  // 3. UPDATE MAP DATA WITH TIME DECAY APPLIED
  // =====================================================================================
useEffect(() => {
  if (!map.current || !map.current.getSource("moods")) return;

  const now = Date.now();
  const HALF_LIFE_HOURS = 8;

  const features = moods
    .filter((m) => m.location)
    .map((m) => {
      const t = m.createdAt?.toMillis?.() || now;
      const ageHours = (now - t) / (1000 * 60 * 60);

      const base = Number(m.moodScore) || 3;
      const decay = Math.exp(-ageHours / HALF_LIFE_HOURS);

      // Boost for visibility
      const decayedScore = Math.max(0.2, base * decay * 1.5);

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [m.location.longitude, m.location.latitude],
        },
        properties: {
          mood: m.mood,
          journal: m.journal,
          userId: m.userId,
          moodScore: Number(decayedScore.toFixed(3)),
        },
      };
    });

  map.current.getSource("moods").setData({
    type: "FeatureCollection",
    features,
  });
}, [moods]);
  // =====================================================================================
  // EMOJI HELPER
  // =====================================================================================
  const getMoodEmoji = (mood) => {
    const map = {
      happy: "😊",
      anxious: "😰",
      sad: "😢",
      angry: "😠",
      hungry: "😋",
      flirty: "😏",
    };
    return map[mood] ?? "🙂";
  };

  // =====================================================================================
  // UI RENDER
  // =====================================================================================
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
{/* FILTER BAR */}
<div style={{ color: "black" }}>
  <div
    style={{
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 16,
      padding: "0 4px",
    }}
  >
    {Object.entries(MOOD_COLORS).map(([mood, color]) => (
      <button
  key={mood}
  className="mood-filter-btn"
  onClick={() => setFilter(mood)}
  style={{
    padding: "7px 16px",
    borderRadius: 20,
    border: "1.5px solid",
    borderColor: filter === mood ? color : "rgba(0,0,0,0.15)",

    background: filter === mood ? color : "#ffffff",

    color: "#000000",
 
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "0.25s ease-in-out",
  }}

  onMouseEnter={(e) => {
    e.target.style.background = color;
    e.target.style.color = "#000000";
  }}

  onMouseLeave={(e) => {
    e.target.style.background =
      filter === mood ? color : "#ffffff";
    e.target.style.color = "#000000";
  }}
>
  {getMoodEmoji(mood)} {mood.charAt(0).toUpperCase() + mood.slice(1)}
</button>
    ))}
  </div>
</div>

      {/* MAP */}
      <div style={{ position: "relative" }}>
        <div
          ref={mapContainer}
          style={{
            width: "100%",
            height: 520,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(48, 45, 53, 0.84)",
          }}
        />

        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(42,31,53,0.7)",
            borderRadius: 20,
            color: "#000000",
            fontSize: 14,
          }}>
            Loading mood data...
          </div>
        )}
      </div>
    </div>
  );
}
