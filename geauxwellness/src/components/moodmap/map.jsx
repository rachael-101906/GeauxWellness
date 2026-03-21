import MoodHeatmap from "./index";

export default function MapPage() {
  return (
    <div style={{ padding: 22, background: "#2a1f35", minHeight: "100vh" }}>
      <h2 style={{ color: "#ede3e9", fontFamily: "Playfair Display, serif", marginBottom: 8 }}>
        LSU Mood Map
      </h2>
      <p style={{ color: "#b8a8c8", marginBottom: 24 }}>
        See how people are feeling across campus
      </p>
      <MoodHeatmap />
    </div>
  );
}