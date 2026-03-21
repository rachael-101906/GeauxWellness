import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoicmJlcmdlcm9uIiwiYSI6ImNtbjB1MWNmODBsdXQycXE0NnJ3eHczYWQifQ.hDACvJteDz9IarKHxlTuXw";

const LSU_CENTER = [-91.1801, 30.4133];

const MOOD_COLORS = {
  happy:   "#FCE365",
  anxious: "#4D4C4C",
  sad:     "#041375",
  angry:   "#520202",
  hungry:  "#FF7C02",
  flirty:  "#BD0243",
};

export default function MoodHeatmap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [filter, setFilter] = useState("all");
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // 1. Fetch moods from Firestore
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

  // 2. Initialize map once
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
      // Add empty source — we'll fill it when moods load
      map.current.addSource("moods", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Heatmap layer — color goes from purple (low) → blush → yellow (high)
      map.current.addLayer({
        id: "mood-heatmap",
        type: "heatmap",
        source: "moods",
        maxzoom: 17,
        paint: {
          // Weight by moodScore (1–5)
          "heatmap-weight": [
            "interpolate", ["linear"],
            ["get", "moodScore"],
            1, 0.2,
            5, 1,
          ],
          // Intensity increases with zoom
          "heatmap-intensity": [
            "interpolate", ["linear"], ["zoom"],
            14, 0.8,
            17, 2,
          ],
          // Color ramp: transparent → purple → blush → warm yellow
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0,    "rgba(0,0,0,0)",
            0.2,  "#9f84bd",
            0.4,  "#C09db8",
            0.6,  "#ebc3db",
            0.8,  "#f7c59f",
            1,    "#FFD700",
          ],
          // Radius grows with zoom
          "heatmap-radius": [
            "interpolate", ["linear"], ["zoom"],
            14, 25,
            17, 50,
          ],
          // Fade heatmap as you zoom in to reveal dots
          "heatmap-opacity": [
            "interpolate", ["linear"], ["zoom"],
            15, 0.9,
            17, 0,
          ],
        },
      });

      // Circle dots layer — visible when zoomed in close
      map.current.addLayer({
        id: "mood-circles",
        type: "circle",
        source: "moods",
        minzoom: 15,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            15, 4,
            17, 14,
          ],
          // Color each dot by mood
          "circle-color": [
            "match", ["get", "mood"],
            "happy",   "#FFD700",
            "anxious", "#FF8C00",
            "sad",     "#4169E1",
            "angry",   "#FF4500",
            "hungry",  "#32CD32",
            "flirty",  "#FF69B4",
            "#9f84bd", // default
          ],
          "circle-opacity": [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            16, 0.9,
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.3)",
        },
      });

      // Click on a dot to see journal entry
      map.current.on("click", "mood-circles", (e) => {
        const props = e.features[0].properties;
        setSelectedEntry(props);
        new mapboxgl.Popup({ offset: 12, closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:'DM Sans',sans-serif; padding:4px;">
              <strong style="text-transform:capitalize;font-size:15px;">${props.mood} ${getMoodEmoji(props.mood)}</strong>
              <p style="margin:6px 0 0;font-size:13px;color:#ccc;line-height:1.5;">${props.journal || "No journal entry"}</p>
            </div>
          `)
          .addTo(map.current);
      });

      map.current.on("mouseenter", "mood-circles", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "mood-circles", () => {
        map.current.getCanvas().style.cursor = "";
      });
    });
  }, []);

  // 3. Update map source whenever moods data changes
  useEffect(() => {
    if (!map.current || !map.current.getSource("moods")) return;

    const features = moods
      .filter((m) => m.location)
      .map((m) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [m.location.longitude, m.location.latitude],
        },
        properties: {
          mood: m.mood,
          moodScore: m.moodScore ?? 3,
          journal: m.journal,
          userId: m.userId,
        },
      }));

    map.current.getSource("moods").setData({
      type: "FeatureCollection",
      features,
    });
  }, [moods]);

  const getMoodEmoji = (mood) => {
    const map = { happy:"😊", anxious:"😰", sad:"😢", angry:"😠", hungry:"😋", flirty:"😏" };
    return map[mood] ?? "😐";
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Filter bar */}
      <div style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 16,
        padding: "0 4px",
      }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "7px 16px",
            borderRadius: 20,
            border: "1.5px solid",
            borderColor: filter === "all" ? "#9f84bd" : "rgba(159,132,189,0.25)",
            background: filter === "all" ? "rgba(159,132,189,0.2)" : "transparent",
            color: filter === "all" ? "#ede3e9" : "#b8a8c8",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          All moods
        </button>
        {Object.entries(MOOD_COLORS).map(([mood, color]) => (
          <button
            key={mood}
            onClick={() => setFilter(mood)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === mood ? color : "rgba(255,255,255,0.1)",
              background: filter === mood ? `${color}22` : "transparent",
              color: filter === mood ? color : "#b8a8c8",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {getMoodEmoji(mood)} {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ position: "relative" }}>
        <div
          ref={mapContainer}
          style={{
            width: "100%",
            height: 520,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(159,132,189,0.2)",
          }}
        />

        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(42,31,53,0.7)",
            borderRadius: 20,
            color: "#ede3e9",
            fontSize: 14,
          }}>
            Loading mood data...
          </div>
        )}

        {/* Legend */}
        <div style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          background: "rgba(42,31,53,0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: 12,
          padding: "12px 16px",
          border: "1px solid rgba(159,132,189,0.2)",
        }}>
          <p style={{ color: "#b8a8c8", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Mood Intensity
          </p>
          <div style={{
            width: 160,
            height: 8,
            borderRadius: 4,
            background: "linear-gradient(90deg, #9f84bd, #ebc3db, #FFD700)",
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "#b8a8c8", fontSize: 11 }}>Low</span>
            <span style={{ color: "#b8a8c8", fontSize: 11 }}>High</span>
          </div>

          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
            {Object.entries(MOOD_COLORS).map(([mood, color]) => (
              <div key={mood} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <span style={{ color: "#ede3e9", fontSize: 12, textTransform: "capitalize" }}>{mood}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response count */}
        <div style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(42,31,53,0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: 20,
          padding: "6px 14px",
          border: "1px solid rgba(159,132,189,0.2)",
          color: "#C09db8",
          fontSize: 13,
          fontWeight: 500,
        }}>
          {moods.length} responses
        </div>
      </div>
    </div>
  );
}