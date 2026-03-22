import { useAuth } from "../context/authContext";
import tigerstadium from "/public/tigerstadium.jpg";
import useMoods, { useProfile } from "../../services/useMoods";

const formatDate = (value, fallbackToToday = false) => {
  if (!value) return fallbackToToday ? new Date().toLocaleDateString() : "Unknown";
  if (typeof value?.toDate === "function") return value.toDate().toLocaleDateString();
  if (typeof value?.seconds === "number") {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackToToday ? new Date().toLocaleDateString() : "Unknown";
  }
  return parsed.toLocaleDateString();
};

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user);
  const { moods, loading: moodsLoading } = useMoods(user?.uid);

  const displayName = (profile?.firstName || user?.firstName || "Rachael").trim();
  const displayEmail = profile?.email || user?.email || "Email";
  const displayMemberSince = formatDate(profile?.createdAt || profile?.memberSince, true);
  const previousMoods = moods.filter((m) => m.mood && m.mood !== "journal");
  const previousEntries = moods.filter((m) => (m.journal || "").trim().length > 0);

  if (!user || profileLoading || moodsLoading) return <p>Loading...</p>;

  return (
    <div style={styles.pageStyle}>
      <div style={styles.mainContent}>
        <div style={styles.contentStyle}>
          <h1 style={{ fontFamily: "Barbaro", color: "White", textShadow: "2px 2px 4px black" }}>Profile</h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            <div style={styles.card}>
              {/* USER INFO */}
              <h2> Hi, {displayName}</h2>
              <p>{displayEmail}</p>
              <p>Member since: {displayMemberSince}</p>
            </div>
            <div style={styles.historyRow}>
            <div style={styles.historyCard}>
              <h3>Previous Entries</h3>
              {previousEntries.length === 0 ? (
                <p>No entries yet.</p>
              ) : (
                previousEntries.map((m) => (
                  <div key={`entry-${m.id}`}>
                    <strong>{m.mood}</strong> — {m.journal}
                    <p>{formatDate(m.createdAt)}</p>
                  </div>
                ))
              )}
            </div>

            <div style={styles.historyCard}>
              <h3>Previous Moods</h3>
              {previousMoods.length === 0 ? (
                <p>No moods yet.</p>
              ) : (
                previousMoods.map((m) => (
                  <div key={`mood-${m.id}`}>
                    <strong>{m.mood}</strong>
                    <p>{formatDate(m.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <h1>GeauxWellness</h1>
        <p>© 2026 GeauxWellness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  pageStyle: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: `url(${tigerstadium})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  mainContent: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    paddingTop: "80px",
    paddingLeft: "60px",
    paddingRight: "20px",
    paddingBottom: "20px",
    boxSizing: "border-box",
    justifyContent: "center",
  },
  contentStyle: {
    width: "min(980px, 95%)",
    minHeight: "400px",
    margin: "0",
    marginBottom: "20px",
    backgroundColor: "#9F84BD",
    borderRadius: "30px",
    padding: "0px 24px 24px 24px",
    boxSizing: "border-box",
    border: "3px solid black",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  historyRow: {
    display: "flex",
    gap: "20px",
    width: "100%",
    alignItems: "stretch",
    flexWrap: "wrap",
  },
  historyCard: {
    flex: "1 1 360px",
    minWidth: "280px",
    border: "3px solid black",
    color: "black",
    margin: "0",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#F5F5F5",
  },
  card: {
    border: "3px solid black",
    color: "black",
    margin: "20px 0px",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    backgroundColor: "#F5F5F5",
  },
  footer: {
    background: "#9F84BD",
    color: "white",
    textAlign: "center",
    width: "100%",
    marginTop: "auto",
    padding: "12px 0",
  },
  footerContent: {
    background: "#9F84BD",
  },
}