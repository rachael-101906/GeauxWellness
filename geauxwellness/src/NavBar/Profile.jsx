import { useAuth } from "../context/authContext";
import useMoods, { useProfile } from "../../services/useMoods";

const formatDate = (value, fallbackToToday = false) => {
  if (!value) return fallbackToToday ? "3/20/2026" : "Unknown";
  if (typeof value?.toDate === "function") return value.toDate().toLocaleDateString();
  if (typeof value?.seconds === "number") {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackToToday ? "3/20/2026" : "Unknown";
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

  if (!user || profileLoading || moodsLoading) return <p className="appContainer">Loading...</p>;

  return (
    <div className="profilePage">
      <div className="profileMainContent">
        <div className="profileContent">
          <h1 className="profileTitle">Profile</h1>

          <div className="profileSections">
            <div className="profileCard">
              {/* USER INFO */}
              <h2> Hi, {displayName}</h2>
              <p>{displayEmail}</p>
              <p>Member since: {displayMemberSince}</p>
            </div>
            <div className="profileHistoryRow">
              <div className="profileHistoryCard">
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

              <div className="profileHistoryCard">
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
      <footer className="profileFooter">
        <div className="profileFooterContent">
          <h1>GeauxWellness</h1>
          <p>© 2026 GeauxWellness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}