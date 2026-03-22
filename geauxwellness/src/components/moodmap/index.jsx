import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useAllMoods } from "../../../services/useMoods";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN;

const LSU_CENTER = [-91.1801, 30.4233];
const HALF_LIFE_HOURS = 10; 

const MOOD_COLORS = {
  happy:   "#FFD700",
  anxious: "#875ECE",
  sad:     "#4169E1",
  angry:   "#FF4500",
  hungry:  "#32CD32",
  flirty:  "#FF69B4",
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
  const hasCenteredOnData = useRef(false);
  const { moods, loading } = useAllMoods(filter);

  const centerMapOnFeatures = (features) => {
    if (!map.current || !features.length) return;

    if (features.length === 1) {
      map.current.flyTo({
        center: features[0].geometry.coordinates,
        zoom: 15.4,
        duration: 700,
      });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    features.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates);
    });

    map.current.fitBounds(bounds, {
      padding: 70,
      maxZoom: 15.4,
      duration: 700,
    });
  };


  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: LSU_CENTER,
      zoom: 20,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      map.current.addSource("moods", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.current.addLayer({
        id: "mood-heatmap",
        type: "heatmap",
        source: "moods",
        maxzoom: 15.5,
        paint: {
          "heatmap-weight": ["get", "moodScore"],
          "heatmap-intensity": [
            "interpolate", ["linear"], ["zoom"],
            13, 0.55,
            14, 0.95,
            16, 1.3,
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
            12, 32,
            14, 46,
            16, 60,
          ],
          "heatmap-opacity": [
            "interpolate", ["linear"], ["zoom"],
            10.5, 0.95,
            12, 0.84,
            13.2, 0.65,
            14.1, 0.5,
            14.8, 0.32,
            15.2, 0.16,
            15.5, 0,
          ],
        },
      });

      map.current.addLayer({
        id: "mood-circles",
        type: "circle",
        source: "moods",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            10, 4,
            12, 6,
            14, 9,
            16, 13,
            18, 16,
          ],
          "circle-color": [
            "match", ["get", "mood"],
            "happy",   "#FFD700",
            "anxious", "#875ECE",
            "sad",     "#4169E1",
            "angry",   "#FF4500",
            "hungry",  "#32CD32",
            "flirty",  "#FF69B4",
            "#9f84bd",
          ],
          "circle-opacity": [
            "interpolate", ["linear"], ["zoom"],
            8, 0.14,
            10, 0.24,
            12, 0.38,
            13.2, 0.54,
            14.1, 0.7,
            15, 0.87,
            16, 0.98,
          ],
          "circle-stroke-width": [
            "interpolate", ["linear"], ["zoom"],
            10, 0.8,
            13, 1.4,
            16, 2.2,
          ],
          "circle-stroke-opacity": [
            "interpolate", ["linear"], ["zoom"],
            10, 0.45,
            13, 0.62,
            16, 0.8,
          ],
          "circle-stroke-color": "rgba(255,255,255,0.8)",
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

        if (pendingFeatures.current.length) {
          centerMapOnFeatures(pendingFeatures.current);
          hasCenteredOnData.current = true;
        }

        pendingFeatures.current = null;
      }
    });
  }, []);

  useEffect(() => {
    hasCenteredOnData.current = false;
  }, [filter]);

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

    if (!hasCenteredOnData.current && features.length) {
      centerMapOnFeatures(features);
      hasCenteredOnData.current = true;
    }
  }, [moods]);

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
            color: filter === "all" ? "#000000" : "#b8a8c8",
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
