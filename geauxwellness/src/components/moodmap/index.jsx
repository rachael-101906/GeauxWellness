import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useAllMoods } from "../../../services/useMoods";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const LSU_CENTER = [-91.1801, 30.4133];
const HALF_LIFE_HOURS = 8;

const MOOD_COLORS = {
  happy:   "#FCE365",
  anxious: "#4D4C4C",
  sad:     "#041375",
  angry:   "#520202",
  hungry:  "#FF7C02",
  flirty:  "#BD0243",
};

const getMoodEmoji = (mood) => ({
  happy: "😊", anxious: "😰", sad: "😢",
  angry: "😠", hungry: "😋", flirty: "😏",
}[mood] ?? "🙂");

export default function MoodHeatmap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const [filter, setFilter] = useState("all");
  const mapLoaded = useRef(false);
  const pendingFeatures = useRef(null);
  

  const { moods, loading } = useAllMoods(filter);

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: LSU_CENTER,
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      map.current.addSource("moods", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        coordinates: [m.location.longitude, m.location.latitude],
      });

      map.current.addLayer({
        id: "mood-heatmap",
        type: "heatmap",
        source: "moods",
        maxzoom: 17,
        paint: {
          "heatmap-weight": ["get", "moodScore"],
          "heatmap-intensity": [
            "interpolate", ["linear"], ["zoom"],
            13, 0.6, 15, 1.2, 17, 2.5,
          ],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0.00, "rgba(0,0,0,0)",
            0.10, "rgba(120,90,150,0.3)",
            0.25, "rgba(180,120,200,0.6)",
            0.45, "rgba(255,140,160,0.75)",
            0.70, "rgba(255,180,80,0.9)",
            1.00, "rgba(255,220,0,1)",
          ],
          "heatmap-radius": [
            "interpolate", ["linear"], ["zoom"],
            13, 30, 15, 45, 17, 70,
          ],
          "heatmap-opacity": [
            "interpolate", ["linear"], ["zoom"],
            15, 0.9, 17, 0,
          ],
        },
      });

      map.current.addLayer({
        id: "mood-circles",
        type: "circle",
        source: "moods",
        minzoom: 15,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            15, 4, 17, 14,
          ],
          "circle-color": [
            "match", ["get", "mood"],
            "happy",   "#FFD700",
            "anxious", "#FF8C00",
            "sad",     "#4169E1",
            "angry",   "#FF4500",
            "hungry",  "#32CD32",
            "flirty",  "#FF69B4",
            "#9f84bd",
          ],
          "circle-opacity": [
            "interpolate", ["linear"], ["zoom"],
            15, 0, 16, 0.9,
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.3)",
        },
      });

      map.current.on("click", "mood-circles", (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup({ offset: 12 })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:sans-serif;padding:4px;">
              <strong style="text-transform:capitalize;">${props.mood} ${getMoodEmoji(props.mood)}</strong>
              <p style="margin:6px 0 0;font-size:13px;color:#ccc;">${props.journal || "No journal entry"}</p>
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

      mapLoaded.current = true;

      if (pendingFeatures.current) {
        map.current.getSource("moods").setData({
          type: "FeatureCollection",
          features: pendingFeatures.current,
        });
        pendingFeatures.current = null;
      }
    });
  }, []);

  useEffect(() => {
    const now = Date.now();

    const features = moods
      .filter((m) => m.location)
      .map((m) => {
        const ageMs = now - (m.createdAt?.toMillis?.() || now);
        const decay = Math.exp(-(ageMs / (1000 * 60 * 60)) / HALF_LIFE_HOURS);
        const decayedScore = (Number(m.moodScore) || 3) * decay;
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [m.location.longitude, m.location.latitude],
          },
          properties: {
            mood: m.mood,
            moodScore: decayedScore,
            journal: m.journal,
          },
        };
      });

    if (!mapLoaded.current || !map.current?.getSource("moods")) {
      pendingFeatures.current = features;
      return;
    }

    map.current.getSource("moods").setData({
      type: "FeatureCollection",
      features,
    });
  }, [moods]);

  if (!MAPBOX_TOKEN) {
    return (
      <div style={{
        fontFamily: "Barbaros",
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 300, background: "#342544", borderRadius: 20,
        color: "#ede3e9", fontSize: 14, padding: 24, textAlign: "center",
        border: "1px solid rgba(159,132,189,0.2)",
        flexDirection: "column", gap: 8,
      }}>
        <span style={{ fontSize: 32 }}>🗺️</span>
        <strong>Map unavailable</strong>
        <p style={{ color: "#b8a8c8", margin: 0 }}>
          Add VITE_MAPBOX_TOKEN to your .env file and restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, padding: "0 4px" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
            borderColor: filter === "all" ? "#9f84bd" : "rgba(159,132,189,0.25)",
            background: filter === "all" ? "rgba(159,132,189,0.2)" : "transparent",
            color: filter === "all" ? "#ede3e9" : "#b8a8c8",
            cursor: "pointer", fontSize: 13, fontWeight: 500,
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

      {/* Map container */}
      <div style={{ position: "relative" }}>
        <div
          ref={mapContainer}
          style={{
            width: "100%", height: 520, borderRadius: 20,
            overflow: "hidden", border: "1px solid rgba(48, 45, 53, 0.84)",
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

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 16, left: 16,
          background: "rgba(42,31,53,0.85)", backdropFilter: "blur(8px)",
          borderRadius: 12, padding: "12px 16px",
          border: "1px solid rgba(159,132,189,0.2)",
        }}>
          <p style={{ color: "#b8a8c8", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Mood Intensity
          </p>
          <div style={{
            width: 160, height: 8, borderRadius: 4,
            background: "linear-gradient(90deg, #9f84bd, #ebc3db, #FFD700)",
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 12 }}>
            <span style={{ color: "#b8a8c8", fontSize: 11 }}>Low</span>
            <span style={{ color: "#b8a8c8", fontSize: 11 }}>High</span>
          </div>
          {Object.entries(MOOD_COLORS).map(([mood, color]) => (
            <div key={mood} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
              <span style={{ color: "#ede3e9", fontSize: 12, textTransform: "capitalize" }}>{mood}</span>
            </div>
          ))}
        </div>

        {/* Count badge */}
        <div style={{
          position: "absolute", top: 16, left: 16,
          background: "rgba(42,31,53,0.85)", backdropFilter: "blur(8px)",
          borderRadius: 20, padding: "6px 14px",
          border: "1px solid rgba(159,132,189,0.2)",
          color: "#C09db8", fontSize: 13, fontWeight: 500,
        }}>
          {moods.length} responses
        </div>
      </div>
    </div>
  );
}
